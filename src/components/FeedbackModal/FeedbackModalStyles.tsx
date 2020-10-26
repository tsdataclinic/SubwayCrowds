import styled from "styled-components";

const Form = styled.iframe`
  flex: 1;
  border: none;
`;

const CloseButton = styled.div`
  cursor: pointer;
  position: absolute;
  top: 20px;
  right: 40px;
  font-size: 30px;
  color: rgb(255, 187, 0);
`;
const Header = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const Container = styled.div`
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
`;

export const Styles = {
  Form,
  CloseButton,
  Container,
  Content,
  Header,
};
