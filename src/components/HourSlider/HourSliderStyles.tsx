import styled from "styled-components";

const HourSliderContainer = styled.div`
  margin-top: 5px;
  display: flex;
  flex-direction: column;
  width: 95%;
  @media only screen and (min-width: 900px) {
    padding-left: 70px;
  }
  height: 65px;
  box-sizing: border-box;
`;

const Caption = styled.div`
  color: grey;
  font-size: 12px;
  padding-bottom: 10px;
  @media only screen and (min-width: 900px) {
    margin-top: 5px;
    padding-left: 70px;
    font-size: 12px;
  }
`;
export const Styles = {
  HourSliderContainer,
  Caption,
};
