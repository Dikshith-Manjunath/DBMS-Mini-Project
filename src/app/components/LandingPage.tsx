import Footer from "./Footer";
import Header from "./Header";
import HomePg from "./Home";
import Feature from "./Feature";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <HomePg />
      <Feature />
      <Footer />
    </div>
  );
}
