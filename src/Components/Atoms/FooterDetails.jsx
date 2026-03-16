import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from "react";
import { useDataContext } from "../Contexts/DataContext";


export default function FooterDetails() {

  const { fileDetails, hasData } = useDataContext();
  const [footer, setFooter] = useState("SarGRAPH")

  useEffect(() => {
    if (hasData) {
      setFooter(`SarGRAPH | ${fileDetails.hostname} | ${fileDetails.date} | ${fileDetails.fileName}`)
    }

  }, [hasData])

  return (
    <>
      <FontAwesomeIcon icon={faGithub} className="fa-2x" />
      <a href="https://github.com/msLinuxNinja/sargraph" target="_blank" rel="noopener noreferrer" className="pl-3 text-blue-600">msLinuxNinja/sargraph</a>
      <p className="pl-2 m-0">{footer}</p>
      <p className="ml-auto">Version: 0.4.0</p>
    </>
  )
}
