import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex flex-1 items-center justify-center py-10">
      <div className="surface-card rounded-[2rem] p-4 md:p-6">
        <SignUp signInUrl="/sign-in" fallbackRedirectUrl="/" />
      </div>
    </main>
  );
}
