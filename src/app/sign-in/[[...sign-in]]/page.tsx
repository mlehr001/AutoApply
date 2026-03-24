import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div
      style={{
        minHeight:      "100vh",
        background:     "#2C3E50",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
      }}
    >
      <SignIn
        appearance={{
          elements: {
            card:             { borderRadius: 0 },
            formButtonPrimary:{ borderRadius: 0 },
          },
        }}
      />
    </div>
  );
}
