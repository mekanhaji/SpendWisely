import ItemCardLayout, {
  ItemCardBody,
  ItemCardHeaderDescription,
  ItemCardHeaderTitle,
} from "@/layout/ItemCardLayout";
import { cn } from "@/lib/utils";

export type SettingsCardProps = {
  title: string;
  description: string;
  /** Width classes for the control slot. Defaults to a third of the card. */
  bodyClassName?: string;
  children: React.ReactNode;
};

const SettingsCard = ({
  title,
  description,
  bodyClassName = "w-2/6",
  children,
}: SettingsCardProps) => (
  <ItemCardLayout className="flex-col items-stretch gap-1.5">
    <div className="flex items-center justify-between gap-3">
      <ItemCardHeaderTitle>{title}</ItemCardHeaderTitle>
      <ItemCardBody className={cn("mt-0", bodyClassName)}>{children}</ItemCardBody>
    </div>
    <ItemCardHeaderDescription className="w-full">{description}</ItemCardHeaderDescription>
  </ItemCardLayout>
);

export default SettingsCard;