import Button from "@mui/material/Button";
import Head from "next/head";
import styled from "styled-components";
import Image from "next/image";
import AppChatLogo from "assets/pancake_logo.svg";
import { auth, getAuthProvider } from "@/config/firebase";
import { signInWithPopup } from "firebase/auth";
import { useState } from "react";

const StyledContainer = styled.div`
  height: 100vh;
  display: grid;
  place-items: center;
  background-color: whitesmoke;
`;

const StyledLoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100px;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
`;

const StyledImageWrapper = styled.div`
  margin-bottom: 50px;
`;

const StyledButtonLoginGg = styled.div`
  margin: 20px 0;
`;

// const StyledButtonLoginFb = styled.div``;

const Login = () => {
  const [loginError, setLoginError] = useState<boolean>(false);

  const signInWithProvider = async (providerName: string) => {
    const provider = getAuthProvider(providerName);
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        // Đăng nhập thành công
      }
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") {
        // Đây là do user tắt popup
        setLoginError(true);
      } else {
        // Đây là do vấn đề đăng nhập
        console.error("Đăng nhập không thành công:", error);
      }
    }
  };

  return (
    <StyledContainer>
      <Head>
        <title>Login</title>
      </Head>
      <StyledLoginContainer>
        <StyledImageWrapper>
          <Image src={AppChatLogo} alt="AppChatLogo" height={200} width={200} />
        </StyledImageWrapper>
        {loginError && <p>Đăng nhập không thành công. Vui lòng thử lại.</p>}
        <StyledButtonLoginGg>
          <Button
            variant="outlined"
            onClick={() => signInWithProvider("google")}
          >
            Đăng nhập bằng Google
          </Button>
        </StyledButtonLoginGg>
        {/* <StyledButtonLoginFb>
          <Button
            variant="outlined"
            onClick={() => signInWithProvider("facebook")}
          >
            Đăng nhập bằng Facebook
          </Button>
        </StyledButtonLoginFb> */}
      </StyledLoginContainer>
    </StyledContainer>
  );
};

export default Login;
