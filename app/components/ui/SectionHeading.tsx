interface Props{

badge:string

title:string

description:string

}

export default function SectionHeading({

badge,

title,

description

}:Props){

return(

<div className="mx-auto max-w-3xl text-center">

<span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">

{badge}

</span>

<h2 className="mt-6 text-5xl font-bold">

{title}

</h2>

<p className="mt-6 text-lg text-muted-foreground">

{description}

</p>

</div>

)

}