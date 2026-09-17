import { Button } from "@/components/ui/button";

export default function GradientButton({
  children,
}:{
  children:React.ReactNode
}){

return(

<Button

className="

rounded-2xl

bg-gradient-to-r

from-emerald-600

to-emerald-500

px-8

shadow-lg

transition-all

duration-300

hover:scale-105

hover:shadow-emerald-300

"

>

{children}

</Button>

)

}