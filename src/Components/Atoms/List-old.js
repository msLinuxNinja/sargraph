import { useContext } from "react";
import Select from "react-select";
import { DataContext } from "../Contexts/DataContext";


export default function ItemList(items) {
    const { setSelectedOption } = useContext(DataContext);

    function handleChange(selectedOption) {
        setSelectedOption(selectedOption);
    }

    const options = [];
    items.items.forEach(item => {
        options.push({ value: item, label: item})
        
    });
    const colorStyles = {
        control: (styles) => ({
            ...styles, 
            backgroundColor: "#111111d",
            width: 200,
            padading: 20,
            margin: 10
        }),
        menuList: (styles) => ({
            ...styles,
            backgroundColor: "#111111d5",
            border: "black",
            width: 200,
        }),
        menu: (styles) => ({
            ...styles,
            width: 200
        }),
        menuPortal: (styles) => ({
            ...styles,
            width: 200
        }),
        multiValue: (styles) => ({
            ...styles,
            backgroundColor: "#8d858f"
        }),
        option: (styles) => ({ // options list
            ...styles,
            backgroundColor: "grey",
            ':hover': {
                backgroundColor: "black",
                transition: "300ms",
            }
        })
    }
    return(
        <Select options={options} styles={colorStyles} onChange={handleChange}  />
    )
}