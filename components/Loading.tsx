import styled from "styled-components";
import CircularProgress from "@mui/material/CircularProgress";

const StyledContainer = styled.div`
  display: grid;
  place-items: center;
  height: 100vh;
`;

const Loading = () => {
  return (
    <StyledContainer>
      <CircularProgress />
    </StyledContainer>
  );
};

export default Loading;
