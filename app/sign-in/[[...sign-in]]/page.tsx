import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex flex-1 items-center justify-center py-10">
      <div className="surface-card rounded-[2rem] p-4 md:p-6">
        <SignIn signUpUrl="/sign-up" fallbackRedirectUrl="/" />
      </div>
    </main>
  );
}
