import styled from "styled-components";

const MetricSelectorContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  box-sizing: border-box;
  padding: 10px 20px;
`;

type MetricTabProps = {
  selected: boolean;
};

const MetricTab = styled.div`
  font-weight: ${({ selected }: MetricTabProps) =>
    selected ? "bold" : "normal"};

  text-decoration: ${({ selected }: MetricTabProps) =>
    selected ? "underline" : "none"};
`;

export const Styles = {
  MetricSelectorContainer,
  MetricTab,
};
