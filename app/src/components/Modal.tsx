import React, { PropsWithChildren, useState } from "react";

type ModalProps = PropsWithChildren<{ title: string }>;
function Modal({ title, children }: ModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <div className="flex justify-center">
      <button
        className="group btn w-full md:w-60 bg-primary hover:bg-primary-dark
          text-dark dark:text-white"
        onClick={handleOpen}
      >
        <span className="block group-disabled:hidden">{title}</span>
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-primary p-4 rounded relative max-w-md">
            <button
              onClick={handleClose}
              className="absolute right-0 top-0 p-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="p-4">
              {/* Content of the modal */}
              <h1 className="text-xl mb-4">{title}</h1>
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Modal;
