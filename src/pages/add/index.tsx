import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { parseSharedAmount } from "@/lib/pwa";
import { useAddIntentStore } from "@/store";

const MAX_NOTE_LENGTH = 80;

/**
 * Landing route for the "Add expense" shortcut and the Web Share Target
 * (?title=&text=&url=). It only records what to prefill, then hands over to
 * Home, which opens the add sheet.
 */
const AddIntentRoute = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const requestAdd = useAddIntentStore((state) => state.request);

  useEffect(() => {
    const shared = [params.get("title"), params.get("text"), params.get("url")]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    const amount = parseSharedAmount(shared);

    requestAdd({
      amount: amount === undefined ? undefined : String(amount),
      notes: shared ? shared.slice(0, MAX_NOTE_LENGTH) : undefined,
    });
    navigate("/", { replace: true });
  }, [params, navigate, requestAdd]);

  return null;
};

export default AddIntentRoute;
