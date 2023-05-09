import { Select } from "antd";


export default function ItemList(props) {


  function handleChange(selectedOption) {
    const dataIndex = props.items.indexOf(selectedOption)
    props.setValue(dataIndex);
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
