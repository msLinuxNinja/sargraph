import { Select } from "antd";


export default function ItemList(props) {


  function handleChange(selectedOption) {
    props.setValue(selectedOption);
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
      style={{
        width: 400,
      }}
      showSearch={props.showSearch}
    />
  );
}
