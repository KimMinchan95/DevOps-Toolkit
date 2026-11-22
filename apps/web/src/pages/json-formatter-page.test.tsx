import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { JsonFormatterPage } from "./json-formatter-page";

function editor() {
  return screen.getByRole("textbox", { name: "JSON 입력" });
}

describe("JsonFormatterPage", () => {
  it("formats, minifies, and reports the broken position", async () => {
    const user = userEvent.setup();
    render(<JsonFormatterPage locale="ko" />);

    expect(document.title).toBe("JSON Formatter · DevOps Toolkit");
    fireEvent.change(editor(), { target: { value: '{"ok":true}' } });
    await user.click(screen.getByRole("button", { name: "정리" }));
    expect(editor()).toHaveValue('{\n  "ok": true\n}');
    expect(screen.getByRole("status")).toHaveTextContent("정리했습니다.");

    await user.click(screen.getByRole("button", { name: "압축" }));
    expect(editor()).toHaveValue('{"ok":true}');
    expect(screen.getByRole("status")).toHaveTextContent("한 줄로 줄였습니다.");

    fireEvent.change(editor(), { target: { value: '{"a":1,}' } });
    await user.click(screen.getByRole("button", { name: "정리" }));
    expect(editor()).toHaveValue('{"a":1,}');
    expect(screen.getByRole("status")).toHaveTextContent("1행 8열을 확인하세요.");
    expect(screen.getByTestId("json-error-mark")).toHaveTextContent("}");
    expect(screen.getAllByTestId("json-error-arrow")).toHaveLength(1);

    fireEvent.change(editor(), { target: { value: '{\n  "a": 1,\n}' } });
    await user.click(screen.getByRole("button", { name: "정리" }));
    expect(screen.getByTestId("json-error-mark")).toHaveTextContent("}");

    fireEvent.change(editor(), { target: { value: '{"ok":true}' } });
    expect(screen.queryByTestId("json-error-mark")).not.toBeInTheDocument();
  });

  it("marks an unquoted value instead of the first column", async () => {
    const user = userEvent.setup();
    render(<JsonFormatterPage locale="ko" />);
    fireEvent.change(editor(), { target: { value: '{\n  "도로시": 오즈로 돌아가고 싶어요"\n}' } });

    await user.click(screen.getByRole("button", { name: "정리" }));

    expect(screen.getByRole("status")).toHaveTextContent("2행");
    expect(screen.getByRole("status")).not.toHaveTextContent("1행 1열");
    expect(screen.getByTestId("json-error-mark")).toHaveTextContent("오");
    expect(screen.getAllByTestId("json-error-arrow")).toHaveLength(1);
  });

  it("marks only the line where a quote is left open", async () => {
    const user = userEvent.setup();
    render(<JsonFormatterPage locale="ko" />);
    fireEvent.change(editor(), {
      target: { value: '{\n  "한 줄 배열: [\n    "나무위키는",\n    "누구나"\n  ]\n}' },
    });

    await user.click(screen.getByRole("button", { name: "정리" }));

    expect(screen.getAllByTestId("json-error-arrow")).toHaveLength(1);
    expect(screen.getByRole("status")).toHaveTextContent("2행 13열을 확인하세요.");
    expect(screen.getByRole("status")).not.toHaveTextContent("4행");
  });

  it("marks every broken line with an arrow", async () => {
    const user = userEvent.setup();
    render(<JsonFormatterPage locale="ko" />);
    fireEvent.change(editor(), { target: { value: '{\n  "a": 오즈,\n  "b": 진짜\n}' } });

    await user.click(screen.getByRole("button", { name: "정리" }));

    expect(screen.getAllByTestId("json-error-arrow")).toHaveLength(2);
    expect(screen.getAllByTestId("json-error-mark").map((mark) => mark.textContent)).toEqual(["오", "진"]);
    expect(screen.getByRole("status")).toHaveTextContent("2행 8열, 3행 8열을 확인하세요.");
  });

  it("asks for JSON before formatting or copying an empty editor", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    render(<JsonFormatterPage locale="ko" />);

    await user.click(screen.getByRole("button", { name: "정리" }));
    expect(screen.getByRole("status")).toHaveTextContent("JSON을 먼저 붙여 넣으세요.");

    await user.click(screen.getByRole("button", { name: "복사" }));
    expect(writeText).not.toHaveBeenCalled();
  });

  it("copies the current text and clears it", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    render(<JsonFormatterPage locale="ko" />);
    fireEvent.change(editor(), { target: { value: '{"ok":true}' } });

    await user.click(screen.getByRole("button", { name: "복사" }));
    expect(writeText).toHaveBeenCalledWith('{"ok":true}');
    expect(await screen.findByRole("status")).toHaveTextContent("복사했습니다.");

    await user.click(screen.getByRole("button", { name: "지우기" }));
    expect(editor()).toHaveValue("");
  });

  it("formats with Ctrl+Enter", () => {
    render(<JsonFormatterPage locale="en" />);
    const field = screen.getByRole("textbox", { name: "JSON input" });
    fireEvent.change(field, { target: { value: '{"ok":true}' } });
    fireEvent.keyDown(field, { key: "Enter", ctrlKey: true });

    expect(field).toHaveValue('{\n  "ok": true\n}');
    expect(screen.getByRole("status")).toHaveTextContent("Formatted.");
  });

  it("shows a failure when the browser refuses the clipboard", async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("blocked"));
    render(<JsonFormatterPage locale="ko" />);
    fireEvent.change(editor(), { target: { value: "{}" } });

    await user.click(screen.getByRole("button", { name: "복사" }));

    expect(await screen.findByRole("status")).toHaveTextContent("복사하지 못했습니다.");
  });
});
