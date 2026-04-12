'use client';

import React, { useRef } from 'react';
import { TbTrash } from 'react-icons/tb';

interface Props {
    onClick: () => void;
}

export default function DeleteButtonComponent({ onClick }: Props): React.ReactNode {
    const confirmationModalRef = useRef<HTMLDialogElement>(null);

    return (
        <div className="">
            <button className="btn btn-xs btn-soft btn-error join-item tooltip tooltip-top" onClick={() => confirmationModalRef?.current?.showModal()} data-tip="Delete">
                <TbTrash/>
            </button>
            <dialog id="password-modal" className="modal" ref={confirmationModalRef}>
                <div className="modal-box">
                    <h2 className="text-center">Are you sure you want to delete this URL?</h2>
                    <p className="alert alert-error">This operation is permanent and cannot be undone.</p>

                    <button className="btn btn-error rounded w-full" onClick={onClick}>
                        Yes I am sure
                    </button>

                    <form method="dialog">
                        <button className="btn btn-ghost w-full mt-4">No, go back</button>
                    </form>
                </div>

                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </div>
    );
}