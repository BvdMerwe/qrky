"use client"

import {TbLockPassword, TbMail} from "react-icons/tb";
import {login} from "@/app/login/actions";

export default function FormLoginComponent() {

    return (<form className="flex flex-col gap-4">
        <label className="input w-full">
            <span className="label"><TbMail/></span>
            <input className="" name="email" placeholder="luke@rebels.space"/>
        </label>

        <label className="input w-full">
            <span className="label"><TbLockPassword/></span>
            <input type="password" className="" name="password" placeholder="Password"/>
        </label>

        <label className="cursor-pointer label self-start gap-2">
            <input type="checkbox" className="checkbox"/>
            <span className="label-text">Remember me</span>
        </label>

        <button className="btn btn-primary" formAction={login}>Log in</button>
    </form>);
}