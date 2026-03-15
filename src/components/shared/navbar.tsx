import { Header } from "@/components/header";

export function Navbar() {
  const bookmarkCount = 0;
  const cartCount = 0;

  const isAuthenticated = false;
  const userName = "Hridoy";
  const userEmail = "hasanhridoymahabub9@gmail.com";
  const userImage = "";
  const userRole = "USER";

  return (
    <Header
      bookmarkCount={bookmarkCount}
      isAuthenticated={isAuthenticated}
      cartCount={cartCount}
      userName={userName}
      userEmail={userEmail}
      userImage={userImage}
      userRole={userRole}
    />
  );
}
