import React from "react";
import FormForgotPassword from "@/components/auth/form-forgot-password";

export default function ForgotPasswordPage(): React.ReactNode {
    return <div className="prose mx-auto mt-20">
        <h1>Forgot Password</h1>
        <p>Please provide the email address for your account.</p>
        <FormForgotPassword />
    </div>;
}