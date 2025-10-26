import React from "react";
import FormChangePassword from "@/components/auth/form-change-password";

export default function ResetPasswordPage(): React.ReactNode {

    return <div className="prose mx-auto mt-20">
        <h1>Update your password</h1>

        <FormChangePassword />
    </div>;
}