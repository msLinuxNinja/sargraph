import { Select } from "antd";
import { useDataContext } from "../Contexts/DataContext";

export default function ItemList(props) {
  const { setSelectedOption } = useDataContext();

  function handleChange(selectedOption) {
    setSelectedOption(selectedOption);
  }

  const options = [];
  props.items.forEach((item) => {
    options.push({ value: item, label: item });
  });

  return (
    <Select
      options={options}
      onChange={handleChange}
      placeholder={props.placeHolderText}
      size="large"
      bordered={true}
    />
  );
}
