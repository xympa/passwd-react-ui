import ReactDOM from "react-dom"

export const measureElement = element => {
    const DOMNode = ReactDOM.findDOMNode(element);
    return {
        width: DOMNode.offsetWidth,
        height: DOMNode.offsetHeight,
    };
}