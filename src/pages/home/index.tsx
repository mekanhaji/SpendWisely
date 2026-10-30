import { useEffect, useRef, useState } from "react";
import AppLayout from "../../layout";
import { useAddIntentStore, type AddExpenseIntent } from "@/store";
import CreateUpdateExpenseModal from "./components/CreateUpdateExpenseModal";
import ExpenseRecordsList from "./components/ExpenseRecordsList";
import ExpenseProgressHeader from "./components/ExpenseProgressHeader";
import { TabsContent } from "@/components/ui/tabs";
import Settings from "../settings";
import Analytics from "./analytics";
import type { ExpenseFilter } from "./components/ExpenseRecordsFilter";

const Home = () => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [updateId, setUpdateId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ExpenseFilter>({ mode: "today" });
  const [prefill, setPrefill] = useState<AddExpenseIntent | null>(null);
  const addIntent = useAddIntentStore((state) => state.intent);
  const consumeAddIntent = useAddIntentStore((state) => state.consume);

  // The /add shortcut and share target land here with an optional prefill.
  useEffect(() => {
    if (!addIntent) return;
    setUpdateId(null);
    setPrefill(addIntent);
    setIsDialogOpen(true);
    consumeAddIntent();
  }, [addIntent, consumeAddIntent]);

  // A prefill only applies to the sheet it opened. Cleared on open -> closed
  // only, so the first render (closed) does not wipe a prefill set above.
  const wasDialogOpen = useRef(false);
  useEffect(() => {
    if (wasDialogOpen.current && !isDialogOpen) setPrefill(null);
    wasDialogOpen.current = isDialogOpen;
  }, [isDialogOpen]);

  return (
    <AppLayout>
      <main className="my-2 flex flex-col items-center gap-4 pb-28">
        <CreateUpdateExpenseModal
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          setUpdateId={setUpdateId}
          updateId={updateId}
          filter={filter}
          prefill={prefill}
        />
        <TabsContent value="home" className="w-full">
          <div className="my-2 flex flex-col items-center gap-4">
            <ExpenseProgressHeader filter={filter} />

            <ExpenseRecordsList
              setIsDialogOpen={setIsDialogOpen}
              setUpdateId={setUpdateId}
              updateId={updateId}
              filter={filter}
              setFilter={setFilter}
            />
          </div>
        </TabsContent>
        <TabsContent value="analytics">
          <div className="my-2 flex flex-col items-center gap-4">
            <Analytics
              setIsDialogOpen={setIsDialogOpen}
              setUpdateId={setUpdateId}
              updateId={updateId}
            />
          </div>
        </TabsContent>
        <TabsContent value="settings">
          <Settings />
        </TabsContent>
      </main>
    </AppLayout>
  );
};

export default Home;
