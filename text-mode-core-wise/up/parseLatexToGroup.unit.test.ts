import "../../src/tests/run_calc_for_tests";

describe("Smoke", () => {
  test("Parses as group", () => {
    const latex = "1+\\frac{2}{3}";
    const group = (window as any).DesModderFragile.parseLatexToGroup(latex);
    expect(group.type).toEqual("Group");
    expect(group.args.length).toEqual(3);
  });
});
