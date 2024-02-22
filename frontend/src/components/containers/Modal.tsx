import {
  HTMLAttributes,
  MouseEvent,
  PropsWithChildren,
  useEffect,
  useRef,
} from "react";
import { Button } from "../form/Button";

export type ModalProps = HTMLAttributes<HTMLDialogElement> &
  PropsWithChildren<{
    title: string;
    isOpened: boolean;
    onProceed?: () => void;
    onClose: () => void;

    processLabel?: string;
    cancelLabel?: string;
  }>;

const isClickInsideRectangle = (e: MouseEvent, element: HTMLElement) => {
  const r = element.getBoundingClientRect();

  return (
    e.clientX > r.left &&
    e.clientX < r.right &&
    e.clientY > r.top &&
    e.clientY < r.bottom
  );
};

export function Modal({
  title,
  isOpened,
  onProceed,
  onClose,
  children,
  processLabel = "Proceed",
  cancelLabel = "Cancel",
  ...props
}: ModalProps): JSX.Element {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpened) {
      ref.current?.showModal();
      document.body.classList.add("modal-open"); // prevent bg scroll
    } else {
      ref.current?.close();
      document.body.classList.remove("modal-open");
    }

    const modalRef = ref.current;

    return () => {
      modalRef?.close();
      document.body.classList.remove("modal-open");
    };
  }, [isOpened]);

  return (
    <dialog
      className="modal"
      ref={ref}
      onCancel={onClose}
      onClick={(e) => ref.current && !isClickInsideRectangle(e, ref.current)}
      {...props}
    >
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title}</h3>

        <form method="dialog">
          <main className="py-4">{children}</main>

          <div className="modal-action">
            <div className="flex flex-row-reverse gap-2">
              <Button
                type="submit"
                className="btn btn-accent"
                onClick={onProceed ? () => onProceed() : undefined}
              >
                {processLabel}
              </Button>

              <Button className="btn" value="cancel" onClick={() => onClose()}>
                {cancelLabel}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </dialog>
  );
}
