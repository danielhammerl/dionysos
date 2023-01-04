import { removeComments } from "./preprocessor";

describe("preprocessor", () => {
  describe("removeComments", () => {
    it("should remove all comments", () => {
      expect(
        removeComments(`
int x=a+b;//test
//abc

int y;/*++
abcd
efgh//faf//a
****/int z;
`)
      ).toEqual(`
int x=a+b;


int y;int z;
`);
    });
  });
});
