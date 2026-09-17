"use client";

import { useEffect, useState } from "react";
import {
  Clock3,
  MapPin,
  MoonStar,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeader from "@/components/ui/SectionHeader";

type School = "hanafi" | "shafi";

type PrayerName =
  | "Fajr"
  | "Dhuhr"
  | "Asr"
  | "Maghrib"
  | "Isha";

type PrayerTimes = {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
};

type PrayerSchedule = {
  yesterday: PrayerTimes;
  today: PrayerTimes;
  tomorrow: PrayerTimes;
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

type ManualLocation = {
  city: string;
  state: string;
  country: string;
};

type SavedLocation =
  | {
      type: "manual";
      city: string;
      state: string;
      country: string;
    }
  | {
      type: "gps";
      latitude: number;
      longitude: number;
    };

type NextPrayer = {
  name: PrayerName;
  time: Date;
  displayTime: string;
  previousTime: Date;
};

const STORAGE_KEY =
  "deenTrackerPrayerLocation";

const SCHOOL_STORAGE_KEY =
  "deenTrackerPrayerSchool";

const prayerNames: PrayerName[] = [
  "Fajr",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha",
];

/* =====================================================
   DATE
===================================================== */

function formatApiDate(date: Date) {
  return `${String(date.getDate()).padStart(
    2,
    "0"
  )}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${date.getFullYear()}`;
}

/* =====================================================
   TIME
===================================================== */

function parsePrayerTime(
  value: string
) {
  return new Date(value);
}

function formatTime(
  date: Date
) {
  return date.toLocaleTimeString(
    undefined,
    {
      hour: "numeric",
      minute: "2-digit",
    }
  );
}

function formatCountdown(
  milliseconds: number
) {
  if (milliseconds <= 0) {
    return "Now";
  }

  const totalSeconds =
    Math.floor(
      milliseconds / 1000
    );

  const hours =
    Math.floor(
      totalSeconds / 3600
    );

  const minutes =
    Math.floor(
      (totalSeconds % 3600) / 60
    );

  const seconds =
    totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

/* =====================================================
   ALADHAN RESPONSE
===================================================== */

function extractPrayerTimes(
  timings: Record<string, string>
): PrayerTimes {
  return {
    Fajr: timings.Fajr,
    Dhuhr: timings.Dhuhr,
    Asr: timings.Asr,
    Maghrib: timings.Maghrib,
    Isha: timings.Isha,
  };
}

/* =====================================================
   FETCH BY COORDINATES
===================================================== */

async function fetchPrayerDayByCoordinates(
  coordinates: Coordinates,
  date: Date,
  school: School
): Promise<PrayerTimes> {
  const schoolValue =
    school === "hanafi"
      ? "1"
      : "0";

  const params =
    new URLSearchParams({
      latitude:
        String(
          coordinates.latitude
        ),

      longitude:
        String(
          coordinates.longitude
        ),

      school: schoolValue,

      iso8601: "true",
    });

  const response =
    await fetch(
      `https://api.aladhan.com/v1/timings/${formatApiDate(
        date
      )}?${params.toString()}`
    );

  if (!response.ok) {
    throw new Error(
      "Could not load prayer times."
    );
  }

  const data =
    await response.json();

  if (
    data?.code !== 200 ||
    !data?.data?.timings
  ) {
    throw new Error(
      "Prayer times were not returned."
    );
  }

  return extractPrayerTimes(
    data.data.timings
  );
}

/* =====================================================
   FETCH BY CITY / COUNTRY
===================================================== */

async function fetchPrayerDayByLocation(
  location: ManualLocation,
  date: Date,
  school: School
): Promise<PrayerTimes> {
  const schoolValue =
    school === "hanafi"
      ? "1"
      : "0";

  const params =
    new URLSearchParams();

  params.set(
    "city",
    location.city.trim()
  );

  params.set(
    "country",
    location.country.trim()
  );

  if (
    location.state.trim()
  ) {
    params.set(
      "state",
      location.state.trim()
    );
  }

  params.set(
    "school",
    schoolValue
  );

  params.set(
    "iso8601",
    "true"
  );

  const response =
    await fetch(
      `https://api.aladhan.com/v1/timingsByCity/${formatApiDate(
        date
      )}?${params.toString()}`
    );

  if (!response.ok) {
    throw new Error(
      "Could not find prayer times for this location."
    );
  }

  const data =
    await response.json();

  if (
    data?.code !== 200 ||
    !data?.data?.timings
  ) {
    throw new Error(
      "Could not find this city and country. Check the spelling and try again."
    );
  }

  return extractPrayerTimes(
    data.data.timings
  );
}

/* =====================================================
   FETCH COMPLETE GPS SCHEDULE
===================================================== */

async function fetchGpsSchedule(
  coordinates: Coordinates,
  school: School
): Promise<PrayerSchedule> {
  const today =
    new Date();

  const yesterday =
    new Date(today);

  yesterday.setDate(
    yesterday.getDate() - 1
  );

  const tomorrow =
    new Date(today);

  tomorrow.setDate(
    tomorrow.getDate() + 1
  );

  const [
    yesterdayTimes,
    todayTimes,
    tomorrowTimes,
  ] = await Promise.all([
    fetchPrayerDayByCoordinates(
      coordinates,
      yesterday,
      school
    ),

    fetchPrayerDayByCoordinates(
      coordinates,
      today,
      school
    ),

    fetchPrayerDayByCoordinates(
      coordinates,
      tomorrow,
      school
    ),
  ]);

  return {
    yesterday:
      yesterdayTimes,

    today:
      todayTimes,

    tomorrow:
      tomorrowTimes,
  };
}

/* =====================================================
   FETCH MANUAL LOCATION SCHEDULE
===================================================== */

async function fetchManualSchedule(
  location: ManualLocation,
  school: School
): Promise<PrayerSchedule> {
  const today =
    new Date();

  const yesterday =
    new Date(today);

  yesterday.setDate(
    yesterday.getDate() - 1
  );

  const tomorrow =
    new Date(today);

  tomorrow.setDate(
    tomorrow.getDate() + 1
  );

  const [
    yesterdayTimes,
    todayTimes,
    tomorrowTimes,
  ] = await Promise.all([
    fetchPrayerDayByLocation(
      location,
      yesterday,
      school
    ),

    fetchPrayerDayByLocation(
      location,
      today,
      school
    ),

    fetchPrayerDayByLocation(
      location,
      tomorrow,
      school
    ),
  ]);

  return {
    yesterday:
      yesterdayTimes,

    today:
      todayTimes,

    tomorrow:
      tomorrowTimes,
  };
}

/* =====================================================
   FIND NEXT PRAYER
===================================================== */

function findNextPrayer(
  schedule: PrayerSchedule
): NextPrayer | null {
  const now =
    new Date();

  const todayPrayers =
    prayerNames.map(
      (name) => ({
        name,

        time:
          parsePrayerTime(
            schedule.today[name]
          ),
      })
    );

  for (
    let index = 0;
    index <
    todayPrayers.length;
    index++
  ) {
    const prayer =
      todayPrayers[index];

    if (
      prayer.time.getTime() >
      now.getTime()
    ) {
      const previousTime =
        index === 0
          ? parsePrayerTime(
              schedule.yesterday.Isha
            )
          : todayPrayers[
              index - 1
            ].time;

      return {
        name:
          prayer.name,

        time:
          prayer.time,

        displayTime:
          formatTime(
            prayer.time
          ),

        previousTime,
      };
    }
  }

  const tomorrowFajr =
    parsePrayerTime(
      schedule.tomorrow.Fajr
    );

  const todayIsha =
    parsePrayerTime(
      schedule.today.Isha
    );

  return {
    name: "Fajr",

    time:
      tomorrowFajr,

    displayTime:
      formatTime(
        tomorrowFajr
      ),

    previousTime:
      todayIsha,
  };
}

/* =====================================================
   MAIN COMPONENT
===================================================== */

export default function UpcomingPrayer() {
  const [
    school,
    setSchool,
  ] = useState<School>(
    "hanafi"
  );

  const [
    savedLocation,
    setSavedLocation,
  ] =
    useState<SavedLocation | null>(
      null
    );

  const [
    schedule,
    setSchedule,
  ] =
    useState<PrayerSchedule | null>(
      null
    );

  const [
    nextPrayer,
    setNextPrayer,
  ] =
    useState<NextPrayer | null>(
      null
    );

  const [
    countdown,
    setCountdown,
  ] = useState("");

  const [
    progress,
    setProgress,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  const [
    showLocationPanel,
    setShowLocationPanel,
  ] = useState(false);

  const [
    locationMode,
    setLocationMode,
  ] = useState<
    "gps" | "manual"
  >("manual");

  const [
    city,
    setCity,
  ] = useState("");

  const [
    state,
    setState,
  ] = useState("");

  const [
    country,
    setCountry,
  ] = useState("");

  const [
    locationSaving,
    setLocationSaving,
  ] = useState(false);

  /* =====================================================
     LOAD SAVED DATA
  ===================================================== */

  useEffect(() => {
    try {
      const storedLocation =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (storedLocation) {
        const parsed =
          JSON.parse(
            storedLocation
          ) as SavedLocation;

        setSavedLocation(
          parsed
        );

        if (
          parsed.type ===
          "manual"
        ) {
          setCity(
            parsed.city
          );

          setState(
            parsed.state
          );

          setCountry(
            parsed.country
          );
        }
      }

      const storedSchool =
        localStorage.getItem(
          SCHOOL_STORAGE_KEY
        );

      if (
        storedSchool ===
          "hanafi" ||
        storedSchool ===
          "shafi"
      ) {
        setSchool(
          storedSchool
        );
      }
    } catch (error) {
      console.error(
        "Could not load saved prayer settings:",
        error
      );
    }
  }, []);

  /* =====================================================
     SAVE SCHOOL
  ===================================================== */

  useEffect(() => {
    try {
      localStorage.setItem(
        SCHOOL_STORAGE_KEY,
        school
      );
    } catch (error) {
      console.error(
        "Could not save prayer school:",
        error
      );
    }
  }, [school]);

  /* =====================================================
     INITIAL LOCATION
  ===================================================== */

  useEffect(() => {
    /*
     * If the user already has a saved location,
     * use it automatically.
     *
     * Otherwise open the manual location
     * panel instead of forcing GPS.
     */
    if (
      savedLocation
    ) {
      return;
    }

    setShowLocationPanel(
      true
    );
  }, [
    savedLocation,
  ]);

  /* =====================================================
     LOAD PRAYER TIMES
  ===================================================== */

  useEffect(() => {
    if (!savedLocation) {
      setLoading(false);
      return;
    }

    let active = true;

async function loadPrayerTimes() {
  if (!savedLocation) {
    return;
  }

  try {
    setLoading(true);
    setError(null);

    let result: PrayerSchedule;

    if (
      savedLocation.type ===
      "gps"
    ) {
          result =
            await fetchGpsSchedule(
              {
                latitude:
                  savedLocation.latitude,

                longitude:
                  savedLocation.longitude,
              },
              school
            );
        } else {
          result =
            await fetchManualSchedule(
              {
                city:
                  savedLocation.city,

                state:
                  savedLocation.state,

                country:
                  savedLocation.country,
              },
              school
            );
        }

        if (!active) {
          return;
        }

        setSchedule(
          result
        );

        setNextPrayer(
          findNextPrayer(
            result
          )
        );
      } catch (error) {
        console.error(
          "Could not load prayer times:",
          error
        );

        if (active) {
          setError(
            error instanceof
              Error
              ? error.message
              : "Could not load prayer times."
          );

          setSchedule(null);
          setNextPrayer(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadPrayerTimes();

    return () => {
      active = false;
    };
  }, [
    savedLocation,
    school,
  ]);

  /* =====================================================
     LIVE COUNTDOWN
  ===================================================== */

  useEffect(() => {
    if (
      !schedule ||
      !nextPrayer
    ) {
      return;
    }

    function updateCountdown() {
      const upcoming =
        findNextPrayer(
          schedule!
        );

      if (!upcoming) {
        return;
      }

      setNextPrayer(
        upcoming
      );

      const now =
        new Date();

      const remaining =
        upcoming.time.getTime() -
        now.getTime();

      setCountdown(
        formatCountdown(
          remaining
        )
      );

      const total =
        upcoming.time.getTime() -
        upcoming.previousTime.getTime();

      const elapsed =
        now.getTime() -
        upcoming.previousTime.getTime();

      if (total > 0) {
        const percentage =
          Math.min(
            100,
            Math.max(
              0,
              Math.round(
                (elapsed /
                  total) *
                  100
              )
            )
          );

        setProgress(
          percentage
        );
      } else {
        setProgress(0);
      }
    }

    updateCountdown();

    const interval =
      window.setInterval(
        updateCountdown,
        1000
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [
    schedule,
    nextPrayer?.name,
    nextPrayer?.time.getTime(),
  ]);

  /* =====================================================
     MIDNIGHT REFRESH
  ===================================================== */

  useEffect(() => {
    if (!savedLocation) {
      return;
    }

    let previousDate =
      formatApiDate(
        new Date()
      );

    const interval =
      window.setInterval(
        () => {
          const currentDate =
            formatApiDate(
              new Date()
            );

          if (
            currentDate !==
            previousDate
          ) {
            previousDate =
              currentDate;

            /*
             * Re-set the same object as a
             * new reference to reload the
             * schedule.
             */
            setSavedLocation(
              (current) =>
                current
                  ? {
                      ...current,
                    }
                  : null
            );
          }
        },
        60000
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [
    savedLocation,
  ]);

  /* =====================================================
     CHANGE SCHOOL
  ===================================================== */

  function changeSchool(
    newSchool: School
  ) {
    if (
      newSchool === school
    ) {
      return;
    }

    setSchedule(null);
    setNextPrayer(null);
    setCountdown("");
    setProgress(0);

    setSchool(
      newSchool
    );
  }

  /* =====================================================
     USE GPS
  ===================================================== */

  function useCurrentLocation() {
    if (
      !navigator.geolocation
    ) {
      setError(
        "Your browser does not support location access."
      );

      return;
    }

    setLocationSaving(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: SavedLocation =
          {
            type: "gps",

            latitude:
              position.coords
                .latitude,

            longitude:
              position.coords
                .longitude,
          };

        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
              location
            )
          );
        } catch (error) {
          console.error(
            "Could not save GPS location:",
            error
          );
        }

        setSavedLocation(
          location
        );

        setLocationMode(
          "gps"
        );

        setShowLocationPanel(
          false
        );

        setLocationSaving(
          false
        );
      },

      (locationError) => {
        console.error(
          "Geolocation error:",
          locationError.code,
          locationError.message
        );

        setLocationSaving(
          false
        );

        if (
          locationError.code ===
          1
        ) {
          setError(
            "Location permission was denied. You can use manual city selection instead."
          );
        } else if (
          locationError.code ===
          2
        ) {
          setError(
            "Your location could not be determined. Please use manual location."
          );
        } else if (
          locationError.code ===
          3
        ) {
          setError(
            "Location request timed out. Please use manual location."
          );
        } else {
          setError(
            "Could not get your location. Please use manual location."
          );
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 300000,
      }
    );
  }

  /* =====================================================
     SAVE MANUAL LOCATION
  ===================================================== */

  async function saveManualLocation() {
    const cleanCity =
      city.trim();

    const cleanState =
      state.trim();

    const cleanCountry =
      country.trim();

    if (!cleanCity) {
      setError(
        "Please enter a city."
      );

      return;
    }

    if (!cleanCountry) {
      setError(
        "Please enter a country."
      );

      return;
    }

    setLocationSaving(true);
    setError(null);

    /*
     * Test the location first.
     *
     * If AlAdhan cannot find it,
     * we don't save it.
     */
    try {
      const testSchedule =
        await fetchManualSchedule(
          {
            city:
              cleanCity,

            state:
              cleanState,

            country:
              cleanCountry,
          },
          school
        );

      /*
       * If the API returned prayer
       * times, the location is valid.
       */
      if (
        !testSchedule.today.Fajr
      ) {
        throw new Error(
          "This location could not be found."
        );
      }

      const location: SavedLocation =
        {
          type: "manual",

          city:
            cleanCity,

          state:
            cleanState,

          country:
            cleanCountry,
        };

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          location
        )
      );

      setSavedLocation(
        location
      );

      setSchedule(
        testSchedule
      );

      setNextPrayer(
        findNextPrayer(
          testSchedule
        )
      );

      setShowLocationPanel(
        false
      );
    } catch (error) {
      console.error(
        "Could not save manual location:",
        error
      );

      setError(
        error instanceof
          Error
          ? error.message
          : "Could not find this location. Check the spelling and try again."
      );
    } finally {
      setLocationSaving(
        false
      );
    }
  }

  /* =====================================================
     CHANGE LOCATION
  ===================================================== */

  function openLocationPanel() {
    if (
      savedLocation?.type ===
      "manual"
    ) {
      setCity(
        savedLocation.city
      );

      setState(
        savedLocation.state
      );

      setCountry(
        savedLocation.country
      );
    }

    setError(null);

    setShowLocationPanel(
      true
    );
  }

  /* =====================================================
     CLEAR LOCATION
  ===================================================== */

  function clearLocation() {
    try {
      localStorage.removeItem(
        STORAGE_KEY
      );
    } catch (error) {
      console.error(
        "Could not remove saved location:",
        error
      );
    }

    setSavedLocation(
      null
    );

    setSchedule(
      null
    );

    setNextPrayer(
      null
    );

    setShowLocationPanel(
      true
    );
  }

  /* =====================================================
     LOCATION LABEL
  ===================================================== */

  function getLocationLabel() {
    if (!savedLocation) {
      return "No location selected";
    }

    if (
      savedLocation.type ===
      "gps"
    ) {
      return "Current location";
    }

    const parts =
      [
        savedLocation.city,
        savedLocation.state,
        savedLocation.country,
      ].filter(Boolean);

    return parts.join(
      ", "
    );
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <DashboardCard>
      <SectionHeader
        title="Upcoming Prayer"
        subtitle="Prayer times based on your selected location."
      />

      {/* SCHOOL SELECTOR */}

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-300">
            Asr calculation
          </p>

          <p className="text-xs text-slate-500">
            {school ===
            "hanafi"
              ? "Hanafi"
              : "Shafi"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#07111F] p-1">
          <button
            type="button"
            onClick={() =>
              changeSchool(
                "hanafi"
              )
            }
            className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
              school ===
              "hanafi"
                ? "bg-emerald-500 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            Hanafi
          </button>

          <button
            type="button"
            onClick={() =>
              changeSchool(
                "shafi"
              )
            }
            className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
              school ===
              "shafi"
                ? "bg-emerald-500 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            Shafi
          </button>
        </div>
      </div>

      {/* LOCATION */}

      <div className="mt-4 rounded-xl border border-slate-800 bg-[#07111F] p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <MapPin
                size={18}
                className="text-emerald-400"
              />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-slate-500">
                Prayer location
              </p>

              <p className="truncate text-sm font-medium text-slate-300">
                {getLocationLabel()}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={
              openLocationPanel
            }
            className="shrink-0 rounded-lg px-3 py-2 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/10"
          >
            Change
          </button>
        </div>
      </div>

      {/* LOCATION PANEL */}

      {showLocationPanel && (
        <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-[#081522] p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-white">
                Choose Location
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Use GPS or enter any city and country manually.
              </p>
            </div>

            {savedLocation && (
              <button
                type="button"
                onClick={() =>
                  setShowLocationPanel(
                    false
                  )
                }
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-white"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* GPS */}

          <button
            type="button"
            onClick={
              useCurrentLocation
            }
            disabled={
              locationSaving
            }
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50"
          >
            <MapPin size={17} />

            {locationSaving &&
            locationMode ===
              "gps"
              ? "Getting location..."
              : "Use My Current Location"}
          </button>

          {/* DIVIDER */}

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-800" />

            <span className="text-xs text-slate-600">
              OR ENTER MANUALLY
            </span>

            <div className="h-px flex-1 bg-slate-800" />
          </div>

          {/* COUNTRY */}

          <div>
            <label
              htmlFor="prayer-country"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Country
            </label>

            <input
              id="prayer-country"
              value={
                country
              }
              onChange={(event) =>
                setCountry(
                  event.target.value
                )
              }
              placeholder="e.g. India"
              autoComplete="country-name"
              className="w-full rounded-xl border border-[#172235] bg-[#07111F] px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500"
            />
          </div>

          {/* STATE */}

          <div className="mt-4">
            <label
              htmlFor="prayer-state"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              State / Province
              <span className="ml-1 text-xs font-normal text-slate-600">
                optional
              </span>
            </label>

            <input
              id="prayer-state"
              value={
                state
              }
              onChange={(event) =>
                setState(
                  event.target.value
                )
              }
              placeholder="e.g. Andhra Pradesh"
              autoComplete="address-level1"
              className="w-full rounded-xl border border-[#172235] bg-[#07111F] px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500"
            />
          </div>

          {/* CITY */}

          <div className="mt-4">
            <label
              htmlFor="prayer-city"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              City
            </label>

            <div className="relative">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
              />

              <input
                id="prayer-city"
                value={
                  city
                }
                onChange={(event) =>
                  setCity(
                    event.target.value
                  )
                }
                placeholder="e.g. Kurnool"
                autoComplete="address-level2"
                className="w-full rounded-xl border border-[#172235] bg-[#07111F] py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* SAVE */}

          <button
            type="button"
            onClick={
              saveManualLocation
            }
            disabled={
              locationSaving
            }
            className="mt-5 w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {locationSaving
              ? "Finding Prayer Times..."
              : "Use This Location"}
          </button>

          {/* CLEAR */}

          {savedLocation && (
            <button
              type="button"
              onClick={
                clearLocation
              }
              className="mt-3 w-full rounded-xl px-4 py-2 text-sm text-slate-500 transition hover:bg-slate-800 hover:text-slate-300"
            >
              Clear Saved Location
            </button>
          )}
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
          <p className="text-sm leading-6 text-rose-200">
            {error}
          </p>
        </div>
      )}

      {/* PRAYER CARD */}

      <div className="mt-6 rounded-2xl border border-emerald-500/15 bg-[#0A1624] p-8">
        {loading ? (
          <div className="py-8 text-center">
            <RefreshCw
              size={28}
              className="mx-auto animate-spin text-emerald-400"
            />

            <p className="mt-4 text-sm text-slate-400">
              Calculating prayer times...
            </p>
          </div>
        ) : nextPrayer ? (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400">
                  Next Prayer
                </p>

                <h2 className="mt-2 text-4xl font-bold text-white">
                  {nextPrayer.name}
                </h2>

                <p className="mt-3 flex items-center gap-2 text-slate-400">
                  <Clock3
                    size={18}
                  />

                  {
                    nextPrayer.displayTime
                  }
                </p>
              </div>

              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 shadow-lg">
                <MoonStar
                  size={36}
                  className="text-emerald-400"
                />
              </div>
            </div>

            {/* COUNTDOWN */}

            <div className="mt-8">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  Time Remaining
                </span>

                <span className="font-medium text-emerald-400">
                  {countdown}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-[#172235]">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-1000"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>

            {/* LOCATION + SCHOOL */}

            <div className="mt-5 flex flex-wrap gap-3 text-xs text-slate-500">
              <span>
                📍{" "}
                {getLocationLabel()}
              </span>

              <span>
                •
              </span>

              <span>
                {school ===
                "hanafi"
                  ? "Hanafi"
                  : "Shafi"}{" "}
                calculation
              </span>
            </div>
          </>
        ) : (
          <div className="py-8 text-center">
            <MapPin
              size={30}
              className="mx-auto text-slate-600"
            />

            <p className="mt-4 text-sm text-slate-400">
              Choose a location to see prayer times.
            </p>

            <button
              type="button"
              onClick={
                openLocationPanel
              }
              className="mt-4 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
            >
              Choose Location
            </button>
          </div>
        )}
      </div>
    </DashboardCard>
  );
}