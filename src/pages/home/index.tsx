import { useState } from "react";
import AppLayout from "../../layout";
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

  return (
    <AppLayout>
      <main className="my-2 flex flex-col items-center gap-4">
        <CreateUpdateExpenseModal
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          setUpdateId={setUpdateId}
          updateId={updateId}
          filter={filter}
        />
        <TabsContent value="home" className="w-full">
          <div className="my-2 flex flex-col items-center gap-4">
            <ExpenseProgressHeader />

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
