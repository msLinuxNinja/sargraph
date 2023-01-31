import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from "react";
import { useDataContext } from "../Contexts/DataContext";


export default function FooterDetails() {

    const { fileDetails, hasData, loadTime, isLoading, dataLoaded } = useDataContext();
    const [ footer, setFooter ] = useState("SarGRAP")

    useEffect(() => {
        setFooter(`SarGRAPH | Component load time ${loadTime}ms | Is it loading? ${isLoading} | Is dataLoaded? ${dataLoaded}`)
        
    }, [loadTime])


    return (
        <>
            <FontAwesomeIcon icon={faGithub} />
            <a href="https://github.com/msLinuxNinja/sargraph" target="_blank" rel="noopener noreferrer">https://github.com/msLinuxNinja/sargraph</a>
            <p>{footer}</p>
        </>
    )
}
