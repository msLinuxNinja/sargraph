import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from "react";
import { useDataContext } from "../Contexts/DataContext";


export default function FooterDetails() {

    const { fileDetails, hasData } = useDataContext();
    const [ footer, setFooter ] = useState("SarGRAPH")
    console.log(process.env.REACT_APP_VERSION)

    useEffect(() => {
        if(hasData) {
            setFooter(`SarGRAPH | ${fileDetails.date} | ${fileDetails.fileName}`)
        }
        
    }, [hasData])

    return (
        <>
            <FontAwesomeIcon icon={faGithub} className="fa-2x"/>
            <a href="https://github.com/msLinuxNinja/sargraph" target="_blank" rel="noopener noreferrer" className="pl-3 text-blue-600">https://github.com/msLinuxNinja/sargraph</a>
            <p className="pl-2">{footer}</p>
            <p className="ml-auto">Version: {process.env.REACT_APP_VERSION}</p>
        </>
    )
}
