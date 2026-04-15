import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ChevronLeft, Settings2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

type HeaderProps = {
  /**
   * Title of the header
   * @default Spend Wisely
   * @example
   * title="Settings"
   */
  title?: string;
  /**
   * If true, a back button will be shown and on click it will go to previous page from browser history.
   * If a string is provided, it will be used as back url.
   * @default false
   * @example
   * back={true}
   *
   * back="/"
   * back="/settings"
   */
  back?: boolean | string;
  /**
   * If true, a settings icon will be shown and on click it will go to settings page.
   * @default true
   * @example
   * showSettingsIcon={false}
   */
  showSettingsIcon?: boolean;
};

type AppLayoutProps = {
  children: React.ReactNode;
  headerOptions?: HeaderProps;
};

const Header = (props: HeaderProps) => {
  const {
    title = "Spend Wisely",
    back = false,
    showSettingsIcon = true,
  } = props;
  const navigator = useNavigate();
  return (
    <div className="flex justify-center items-center my-4">
      {/* {Boolean(back) && (
        <ChevronLeft
          className="text-3xl mx-2 cursor-pointer select-none"
          onClick={() =>
            typeof back === "string" ? navigator(back) : navigator(-1)
          }
        />
      )} */}
      <h1 className="text-3xl font-bold flex items-center cursor-default select-none">
        {title}
      </h1>
      {/* <span
        className={cn("text-2xl cursor-pointer", {
          invisible: !showSettingsIcon,
        })}
        aria-disabled={!showSettingsIcon}
        onClick={() => navigator("/settings")}
      >
        <Settings2 />
      </span> */}
    </div>
  );
};

const Nav = () => {
  return (
    <TabsList className="w-full justify-around">
      <TabsTrigger value="home" className="w-full">
        Home
      </TabsTrigger>
      <TabsTrigger value="analytics" className="w-full">
        Analytics
      </TabsTrigger>
      <TabsTrigger value="settings" className="w-full">
        Settings
      </TabsTrigger>
    </TabsList>
  );
};

const AppLayout = ({ children, headerOptions }: AppLayoutProps) => {
  return (
    <div className="mx-auto max-w-[625px] mt-2 px-4">
      <Header {...headerOptions} />
      <Tabs defaultValue="home">
        <Nav />
        {children}
      </Tabs>
    </div>
  );
};

export default AppLayout;
