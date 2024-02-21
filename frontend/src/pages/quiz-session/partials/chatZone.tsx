import { Button } from "#/components/form/Button";
import { Input } from "#/components/form/Input";
import { SendHorizonalIcon } from "lucide-react";
import { useEffect, useState } from "react";

export function ChatZone(): JSX.Element {
  const [chatText, setChatText] = useState<string>("");
  const [isComposing, setIsComposing] = useState<boolean>(false);

  useEffect(() => {
    // If the user isn't composing and the chat text is not empty, then the user is composing
    if (!isComposing && chatText.length > 0) {
      console.log("User is composing");
      setIsComposing(true);
    }
    // Otherwise, if the user is composing and the chat text is empty, then the user stopped composing
    else if (isComposing && chatText.length === 0) {
      console.log("User stopped composing");
      setIsComposing(false);
    }

    const timeout = window.setTimeout(() => {
      // Send composing event

      console.log("User stopped composing");
      setIsComposing(false);
    }, 1500);

    // Fetch messages
    return () => {
      window.clearTimeout(timeout);
    };
  }, [chatText]);

  return (
    <section className="p-2 pb-0 h-full w-full flex flex-col gap-4">
      <div className="rounded-lg flex-1"></div>

      <div className="flex flex-col">
        <div className="flex flex-row gap-2">
          <Input
            className="flex-1 max-w-none"
            placeholder="Type a message"
            onChange={(event) => setChatText(event.target.value)}
          />
          <Button className="btn-square" aria-label="Send">
            <SendHorizonalIcon className="w-5 h-5" />
          </Button>
        </div>

        <div className="text-sm px-2">
          <span className="text-gray-700">
            <strong>Someone</strong> is writing...
          </span>
        </div>
      </div>
    </section>
  );
}
