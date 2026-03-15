import { LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Logout() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const logoutMutation = {
    isPending: false,
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={logoutMutation.isPending}
      className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-950 dark:hover:bg-red-950/20"
    >
      <LogOutIcon className="mr-2 size-4" />
      {logoutMutation.isPending ? "Logging out..." : "Logout"}
    </Button>
  );
}
