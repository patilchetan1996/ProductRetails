// import { render, fireEvent, screen } from "@testing-library/react";
import VcProduct from "../JS/VcProduct.js";

//test block
test("increments counter", () => {
// render the component on virtual dom
render(<VcProduct/>);

//select the elements you want to interact with
// const counter = screen.getByTestId("addProduct");
const incrementBtn = screen.getByTestId("addProduct");

//interact with those elements
fireEvent.click(incrementBtn);

//assert the expected result
expect(counter).toHaveTextContent("1");
});