'use client';

import { TbMail, TbUser, TbUserFilled } from 'react-icons/tb';
import { register } from '@/app/register/actions';
import { useActionState, useState } from 'react';
import cc from 'classcat';
import InputPassword from '@/components/ui/form/input-password';
import ErrorMessageComponent from '@/components/ui/alert/error-message';
import SuccessMessageComponent from '@/components/ui/alert/success-message';
import Input from '@/components/ui/form/input';

const initialState = { message: '', success: false };

export default function FormRegisterComponent() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [passwordConfirm, setPasswordConfirm] = useState<string>('');
    const [state, registerAction, pending] = useActionState(register, initialState);

    return (<form className="flex flex-col gap-4">
        <Input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={setEmail}
            icon={<TbMail />}
        />

        <Input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={firstName}
            onChange={setFirstName}
            icon={<TbUser />}
        />

        <Input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={lastName}
            onChange={setLastName}
            icon={<TbUserFilled />}
        />

        <div className="tooltip tooltip-top md:tooltip-right">
            <div className="tooltip-content p-4 rounded-box">
                <div className="prose text-left">
                    <h3 className="text-base-100">Requirements:</h3>
                    <ol className="leading-tight text-base-100 marker:text-green-500">
                        <li className={
                            cc(['text-green-500', { 'marker:text-red-500 text-red-500': !meetsCondition(password, 'length') }])}
                        >At least 8 characters.</li>
                        <li className={
                            cc(['text-green-500', { 'marker:text-red-500 text-red-500': !meetsCondition(password, 'uppercase') }])}
                        >At least 1 uppercase letter.</li>
                        <li className={
                            cc(['text-green-500', { 'marker:text-red-500 text-red-500': !meetsCondition(password, 'lowercase') }])}
                        >At least 1 lowercase letter.</li>
                        <li className={
                            cc(['text-green-500', { 'marker:text-red-500 text-red-500': !meetsCondition(password, 'digit') }])}
                        >At least 1 number.</li>
                        <li className={
                            cc(['text-green-500', { 'marker:text-red-500 text-red-500': !meetsCondition(password, 'special') }])}
                        >At least 1 special character.</li>
                    </ol>
                </div>
            </div>
            <InputPassword value={password} onChange={setPassword} name="password" placeholder="Password"/>
        </div>

        <InputPassword value={passwordConfirm} onChange={setPasswordConfirm} name="confirmPassword" placeholder="Confirm password"/>

        {state?.success && state?.message && <SuccessMessageComponent message={state.message}/>}

        {!state?.success && state?.message && <ErrorMessageComponent message={state.message}/>}

        {pending
            ? <button className="btn btn-primary" disabled>Register</button>
            : <button
                className={cc(['btn btn-primary', {
                    'btn-disabled': !email || !password || !passwordConfirm,
                }])}
                formAction={registerAction}
            >
                Register
            </button>
        }
    </form>);
}

function meetsCondition(password: string, condition: 'length' | 'uppercase' | 'lowercase' | 'digit' | 'special' ): boolean {
    let regex = new RegExp(/ /, 'i');

    switch (condition) {
        case 'length':
            return password.length >= 8;
        case 'uppercase':
            regex = new RegExp(/[A-Z]+/, 'u');
            break;
        case 'lowercase':
            regex = new RegExp(/[a-z]+/, 'u');
            break;
        case 'digit':
            regex = new RegExp(/[\d]+/, 'u');
            break;
        case 'special':
            regex = new RegExp(/([^\d\w\s]|_)/, 'ug');
            break;
    }
    return regex.test(password);
}