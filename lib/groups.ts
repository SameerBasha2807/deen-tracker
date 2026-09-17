import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

/* =====================================================
   TYPES
===================================================== */

export interface Group {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  inviteCode: string;
  createdAt?: unknown;
}

export interface GroupMember {
  userId: string;
  username: string;
  name: string;
  role: "owner" | "member";
  joinedAt?: unknown;
}

export interface GroupInvite {
  id: string;
  groupId: string;
  groupName: string;
  invitedUserId: string;
  invitedBy: string;
  status: "pending" | "accepted" | "rejected";
  createdAt?: unknown;
}

/* =====================================================
   HELPERS
===================================================== */

/**
 * Generate a short invite code.
 */
function generateInviteCode(): string {
  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "";

  for (let i = 0; i < 8; i++) {
    code +=
      characters[
        Math.floor(
          Math.random() * characters.length
        )
      ];
  }

  return code;
}

/**
 * Reference to a group.
 */
function groupRef(groupId: string) {
  return doc(db, "groups", groupId);
}

/**
 * Reference to a group's members collection.
 */
function memberRef(
  groupId: string,
  userId: string
) {
  return doc(
    db,
    "groups",
    groupId,
    "members",
    userId
  );
}

/* =====================================================
   CREATE GROUP
===================================================== */

export async function createGroup(
  ownerId: string,
  ownerName: string,
  ownerUsername: string,
  name: string,
  description?: string
): Promise<Group> {
  const cleanName = name.trim();
  const cleanDescription =
    description?.trim() || "";

  if (!cleanName) {
    throw new Error(
      "Group name is required."
    );
  }

  if (cleanName.length < 3) {
    throw new Error(
      "Group name must contain at least 3 characters."
    );
  }

  if (cleanName.length > 50) {
    throw new Error(
      "Group name must contain at most 50 characters."
    );
  }

  /*
   * Generate an invite code.
   */
  const inviteCode =
    generateInviteCode();

  /*
   * Create group.
   */
  const groupDocument = await addDoc(
    collection(db, "groups"),
    {
      name: cleanName,
      description: cleanDescription,
      ownerId,
      inviteCode,
      createdAt: serverTimestamp(),
    }
  );

  /*
   * Add owner as first member.
   */
  await setDoc(
    memberRef(
      groupDocument.id,
      ownerId
    ),
    {
      userId: ownerId,
      username: ownerUsername,
      name: ownerName,
      role: "owner",
      joinedAt: serverTimestamp(),
    }
  );

  return {
    id: groupDocument.id,
    name: cleanName,
    description: cleanDescription,
    ownerId,
    inviteCode,
  };
}

/* =====================================================
   GET GROUP
===================================================== */

export async function getGroup(
  groupId: string
): Promise<Group | null> {
  const snapshot = await getDoc(
    groupRef(groupId)
  );

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

  return {
    id: snapshot.id,

    name:
      typeof data.name === "string"
        ? data.name
        : "Group",

    description:
      typeof data.description === "string"
        ? data.description
        : "",

    ownerId:
      typeof data.ownerId === "string"
        ? data.ownerId
        : "",

    inviteCode:
      typeof data.inviteCode === "string"
        ? data.inviteCode
        : "",

    createdAt:
      data.createdAt,
  };
}

/* =====================================================
   GET GROUP MEMBERS
===================================================== */

export async function getGroupMembers(
  groupId: string
): Promise<GroupMember[]> {
  const snapshot = await getDocs(
    collection(
      db,
      "groups",
      groupId,
      "members"
    )
  );

  return snapshot.docs.map(
    (document) => {
      const data =
        document.data();

      return {
        userId: document.id,

        username:
          typeof data.username === "string"
            ? data.username
            : "",

        name:
          typeof data.name === "string"
            ? data.name
            : "User",

        role:
          data.role === "owner"
            ? "owner"
            : "member",

        joinedAt:
          data.joinedAt,
      };
    }
  );
}

/* =====================================================
   GET USER'S GROUPS
===================================================== */

export async function getUserGroups(
  userId: string
): Promise<Group[]> {
  /*
   * Find groups where the user has
   * a membership document.
   */
  const groupsSnapshot =
    await getDocs(
      query(
        collection(db, "groups"),
        where(
          "memberIds",
          "array-contains",
          userId
        )
      )
    );

  return groupsSnapshot.docs.map(
    (document) => {
      const data =
        document.data();

      return {
        id: document.id,

        name:
          typeof data.name === "string"
            ? data.name
            : "Group",

        description:
          typeof data.description === "string"
            ? data.description
            : "",

        ownerId:
          typeof data.ownerId === "string"
            ? data.ownerId
            : "",

        inviteCode:
          typeof data.inviteCode === "string"
            ? data.inviteCode
            : "",

        createdAt:
          data.createdAt,
      };
    }
  );
}

/* =====================================================
   INVITE USER
===================================================== */

export async function inviteUserToGroup(
  groupId: string,
  invitedUserId: string,
  invitedBy: string
): Promise<void> {
  const group = await getGroup(
    groupId
  );

  if (!group) {
    throw new Error(
      "Group not found."
    );
  }

  /*
   * Check whether the invited user
   * is already a member.
   */
  const existingMember =
    await getDoc(
      memberRef(
        groupId,
        invitedUserId
      )
    );

  if (existingMember.exists()) {
    throw new Error(
      "This user is already a member of the group."
    );
  }

  /*
   * Check for an existing pending invite.
   */
  const existingInviteQuery =
    query(
      collection(db, "groupInvites"),
      where(
        "groupId",
        "==",
        groupId
      ),
      where(
        "invitedUserId",
        "==",
        invitedUserId
      ),
      where(
        "status",
        "==",
        "pending"
      ),
      limit(1)
    );

  const existingInvite =
    await getDocs(
      existingInviteQuery
    );

  if (!existingInvite.empty) {
    throw new Error(
      "This user already has a pending invitation."
    );
  }

  /*
   * Create invitation.
   */
  await addDoc(
    collection(
      db,
      "groupInvites"
    ),
    {
      groupId,
      groupName: group.name,
      invitedUserId,
      invitedBy,
      status: "pending",
      createdAt: serverTimestamp(),
    }
  );
}

/* =====================================================
   GET USER INVITATIONS
===================================================== */

export async function getUserGroupInvites(
  userId: string
): Promise<GroupInvite[]> {
  const invitesQuery =
    query(
      collection(db, "groupInvites"),
      where(
        "invitedUserId",
        "==",
        userId
      ),
      where(
        "status",
        "==",
        "pending"
      )
    );

  const snapshot =
    await getDocs(
      invitesQuery
    );

  return snapshot.docs.map(
    (document) => {
      const data =
        document.data();

      return {
        id: document.id,

        groupId:
          typeof data.groupId === "string"
            ? data.groupId
            : "",

        groupName:
          typeof data.groupName === "string"
            ? data.groupName
            : "Group",

        invitedUserId:
          typeof data.invitedUserId === "string"
            ? data.invitedUserId
            : "",

        invitedBy:
          typeof data.invitedBy === "string"
            ? data.invitedBy
            : "",

        status:
          data.status === "accepted"
            ? "accepted"
            : data.status === "rejected"
              ? "rejected"
              : "pending",

        createdAt:
          data.createdAt,
      };
    }
  );
}

/* =====================================================
   ACCEPT INVITATION
===================================================== */

export async function acceptGroupInvite(
  inviteId: string,
  userId: string,
  name: string,
  username: string
): Promise<void> {
  const inviteRef =
    doc(
      db,
      "groupInvites",
      inviteId
    );

  const inviteSnapshot =
    await getDoc(inviteRef);

  if (!inviteSnapshot.exists()) {
    throw new Error(
      "Invitation not found."
    );
  }

  const invite =
    inviteSnapshot.data();

  if (
    invite.invitedUserId !== userId
  ) {
    throw new Error(
      "You cannot accept this invitation."
    );
  }

  if (
    invite.status !== "pending"
  ) {
    throw new Error(
      "This invitation is no longer available."
    );
  }

  const groupId =
    invite.groupId;

  /*
   * Add user to group.
   */
  await setDoc(
    memberRef(
      groupId,
      userId
    ),
    {
      userId,
      username,
      name,
      role: "member",
      joinedAt: serverTimestamp(),
    }
  );

  /*
   * Mark invitation accepted.
   */
  await setDoc(
    inviteRef,
    {
      status: "accepted",
    },
    {
      merge: true,
    }
  );
}

/* =====================================================
   REJECT INVITATION
===================================================== */

export async function rejectGroupInvite(
  inviteId: string,
  userId: string
): Promise<void> {
  const inviteRef =
    doc(
      db,
      "groupInvites",
      inviteId
    );

  const inviteSnapshot =
    await getDoc(inviteRef);

  if (!inviteSnapshot.exists()) {
    throw new Error(
      "Invitation not found."
    );
  }

  const invite =
    inviteSnapshot.data();

  if (
    invite.invitedUserId !== userId
  ) {
    throw new Error(
      "You cannot reject this invitation."
    );
  }

  await setDoc(
    inviteRef,
    {
      status: "rejected",
    },
    {
      merge: true,
    }
  );
}

/* =====================================================
   LEAVE GROUP
===================================================== */

export async function leaveGroup(
  groupId: string,
  userId: string
): Promise<void> {
  const group = await getGroup(
    groupId
  );

  if (!group) {
    throw new Error(
      "Group not found."
    );
  }

  if (group.ownerId === userId) {
    throw new Error(
      "The group owner cannot leave the group. Transfer ownership or delete the group first."
    );
  }

  await deleteDoc(
    memberRef(
      groupId,
      userId
    )
  );
}