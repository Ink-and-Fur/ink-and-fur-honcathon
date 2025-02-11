import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function LoginForm() {
  return (
    <Card className="w-full max-w-sm m-auto sm:mt-40">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Log in with your Google account
        </CardDescription>
      </CardHeader>
      {/* <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required />
        </div>
      </CardContent> */}
      <CardFooter>
        <SignInButton forceRedirectUrl="/">
          <Button className="w-full">Sign in with Google</Button>
        </SignInButton>
      </CardFooter>
    </Card>
  )
}
