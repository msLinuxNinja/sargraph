import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


export default function FooterDetails() {

    return (
        <>
            <FontAwesomeIcon icon={faGithub} />
            <a href="https://github.com/msLinuxNinja/sargraph" target="_blank" rel="noopener noreferrer">https://github.com/msLinuxNinja/sargraph</a>
        </>
    )
}
