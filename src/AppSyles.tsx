import styled from "styled-components";

const ControlBar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 30px;
  .reset-button {
    justify-self: center;
  }
  .day-direction {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
`;

const ResetButton = styled.button`
  color: #27a3aa;
  background-color: white;
  border: none; // solid 2px #27a3aa;

  font-weight: bold;
  padding: 0px 5px 0px 5px;
  cursor: pointer;
  margin-top: 0px;
`;
export const Styles = {
  ControlBar,
  ResetButton,
};
