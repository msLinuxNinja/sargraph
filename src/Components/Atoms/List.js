import { useContext } from "react";
import { Select } from "antd";
import { DataContext } from "../Contexts/DataContext";


export default function ItemList(props) {
    const { setSelectedOption } = useContext(DataContext);

    function handleChange(selectedOption) {
        setSelectedOption(selectedOption);
    }

    const options = [];
    props.items.forEach(item => {
        options.push({ value: item, label: item})
        
    });
    
    return(
        <Select options={options} onChange={handleChange} placeholder={props.placeHolderText} size="large" bordered={true} />
    )
}