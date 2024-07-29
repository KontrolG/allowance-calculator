import { getDateInputValue } from "@/modules/shared/utils/date-input";
import { db } from "@/db";
import { AllowancesTable, SelectAllowances } from "@/db/schema";
import { createAllowance } from "../modules/allowance/actions/create-allowance";
import { PayAllowanceButton } from "../modules/allowance/components/pay-allowance-button";

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

function calculateAllowances(allowances: SelectAllowances[]) {
  const lastAllowance = allowances?.at?.(-1);
  if (!lastAllowance) return [];

  let lastAllowanceAmount = parseFloat(lastAllowance.amount);

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
        amount: amount?.toString?.(),
        createdAt: date,
        date: date.toString(),
        diff: diff?.toString?.(),
        isCalculated: true,
      };
    });
}

export default async function Home() {
  const allowances = await db.select().from(AllowancesTable);
  const totalPayed =
    allowances.reduce((total, { diff }) => total + parseFloat(diff), 0) ?? 0;
  const calculatedAllowances = calculateAllowances(allowances);

  async function onSubmitAllowance(formData: FormData) {
    "use server";

    const diff = formData.get("diff")!?.toString?.();
    const data = {
      amount: (totalPayed + parseFloat(diff)).toString?.(),
      date: formData.get("date") + "T" + new Date().toISOString().split("T")[1],
      diff,
    };

    await createAllowance(data);
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
          {[...allowances, ...calculatedAllowances].map((allowance, index) => {
            const { date, isCalculated } = allowance;
            const amount = parseFloat(allowance.amount);
            const diff = parseFloat(allowance.diff);

            return (
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
                    <PayAllowanceButton allowance={allowance} />
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
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <th colSpan={3}>Total pagado</th>
            <td>{priceFormat.format(totalPayed)}</td>
          </tr>
        </tfoot>
      </table>
      <form action={onSubmitAllowance}>
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
