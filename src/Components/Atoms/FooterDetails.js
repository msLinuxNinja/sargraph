import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from "react";
import { useDataContext } from "../Contexts/DataContext";


export default function FooterDetails() {

    const { fileDetails, hasData } = useDataContext();
    const [ footer, setFooter ] = useState("SarGRAPH")

    useEffect(() => {
        if(hasData) {
            setFooter(`SarGRAPH | ${fileDetails.date} | ${fileDetails.fileName}`)
        }
        
    }, [hasData])




    return (
        <>
            <FontAwesomeIcon icon={faGithub} />
            <a href="https://github.com/msLinuxNinja/sargraph" target="_blank" rel="noopener noreferrer">https://github.com/msLinuxNinja/sargraph</a>
            <p>{footer}</p>
        </>
    )
}
