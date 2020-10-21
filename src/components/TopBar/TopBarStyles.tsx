import styled from "styled-components";

const TopBar = styled.div`
  width: 100%;
  height: 20px;
  /* box-sizing:border-box; */
  padding: 0px 0px 20px 0px;
  @media only screen and (min-width: 900px) {
    padding: 20px 0px;
  }
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  font-size: 25px;
  button {
    margin-right: 5px;
    font-size: 20px;
  }
`;
const ModalButton = styled.button`
  background: none;
  border: none;
  text-decoration: underline;
  cursor: pointer;
`;
const Links = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;
const DataClinicLink = styled.a`
  display: flex;
  color: black;
  text-decoration: none;
  flex-direction: row;
  align-items: center;
  color: #1e4d5e;
`;

export const Styles = {
  TopBar,
  ModalButton,
  DataClinicLink,
  Links,
};
