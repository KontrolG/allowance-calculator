import { useLocalStorage } from "usehooks-ts";
import { nanoid } from "nanoid";
import { getDateInputValue } from "@/modules/shared/utils/date-input";
import { useMemo } from "react";

const priceFormat = new Intl.NumberFormat("es", {
  style: "currency",
  currency: "USD",
});
const diffFormat = new Intl.NumberFormat("es", {
  style: "currency",
  currency: "USD",
  signDisplay: "always",
});
const dateFormat = new Intl.DateTimeFormat("es", { dateStyle: "medium" });

const currentDate = getDateInputValue(new Date());

interface Allowance {
  id: string;
  date: string;
  amount: number;
  diff: number;
  isCalculated?: boolean;
}

export default function HomePage() {
  const [allowances, setAllowances] = useLocalStorage<Allowance[]>(
    "allowances",
    []
  );
  const totalPayed =
    allowances.reduce((total, { diff }) => total + diff, 0) ?? 0;

  const calculatedAllowances = useMemo(() => {
    const lastAllowance = allowances.at(-1);
    if (!lastAllowance) return [];

    let lastAllowanceAmount = lastAllowance.amount;

    return Array(5)
      .fill(null)
      .map((_, index) => {
        const date = new Date(lastAllowance?.date);
        date.setDate(1);
        date.setMonth(date.getMonth() + (index + 1));
        const amount = lastAllowanceAmount + lastAllowanceAmount * 0.2;
        const diff = amount - lastAllowanceAmount;
        lastAllowanceAmount = amount;

        return {
          id: index,
          amount,
          date: date.toString(),
          diff,
          isCalculated: true,
        };
      });
  }, [allowances]);

  function addAllowance(allowance: Omit<Allowance, "id">) {
    setAllowances([...allowances, { id: nanoid(), ...allowance }]);
  }

  return (
    <div className="space-y-8">
      <h1 className="text-5xl">Calculador de mesada</h1>
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Fecha</th>
            <th>Monto</th>
            <th>Diferencia</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {[...allowances, ...calculatedAllowances].map(
            ({ amount, date, diff, isCalculated }, index) => (
              <tr key={index}>
                <th scope="row">{index + 1}</th>
                <td>{dateFormat.format(new Date(date))}</td>
                <td>{priceFormat.format(amount)}</td>
                <td
                  className={
                    diff > 0 ? "text-success" : diff === 0 ? "" : "text-error"
                  }
                >
                  {diffFormat.format(diff)}
                </td>
                <td>
                  {isCalculated ? (
                    <button
                      className="btn w-full gap-2"
                      type="button"
                      onClick={() => {
                        addAllowance({ amount, date, diff });
                      }}
                    >
                      Pagar{" "}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
                        />
                      </svg>
                    </button>
                  ) : (
                    <span className="text-success flex items-center justify-center font-bold gap-2">
                      Pagado{" "}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                    </span>
                  )}
                </td>
              </tr>
            )
          )}
        </tbody>
        <tfoot>
          <tr>
            <th colSpan={3}>Total pagado</th>
            <td>{priceFormat.format(totalPayed)}</td>
          </tr>
        </tfoot>
      </table>
      <form
        onSubmit={(event) => {
          event.stopPropagation();
          event.preventDefault();

          const formData = new FormData(event.currentTarget);
          const diff = parseFloat(formData.get("diff")!?.toString?.());

          addAllowance({
            amount: totalPayed + diff,
            diff,
            date:
              formData.get("date") +
              "T" +
              new Date().toISOString().split("T")[1],
          });
        }}
      >
        <fieldset>
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Registrar deposito</span>
            </div>
            <div className="join">
              <div>
                <div>
                  <input
                    className="input input-bordered join-item"
                    placeholder="Monto"
                    name="diff"
                  />
                </div>
              </div>
              <input
                className="input input-bordered join-item"
                type="date"
                name="date"
                defaultValue={currentDate}
              ></input>
              <button className="btn btn-primary join-item">Guardar</button>
            </div>
          </label>
        </fieldset>
      </form>
    </div>
  );
}
