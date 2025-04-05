import SignIn from "@/app/(userAuth)/signin/page";
import {SessionProvider} from "next-auth/react";

export default function Home() {
  return (
    <div>
      <SignIn/>
    </div>
  );
}
