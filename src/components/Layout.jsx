import { Outlet } from "react-router-dom";
import { Layout as AntLayout } from "antd";
import Header from "./Header";
import Footer from "./Footer";

const { Content } = AntLayout;

const Layout = () => {
  return (
    <AntLayout className="min-h-screen bg-transparent">
      <Header />
      <Content className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Outlet />
        </div>
      </Content>
      <Footer />
    </AntLayout>
  );
};

export default Layout;
