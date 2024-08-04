import { getDateInputValue } from "@/modules/shared/utils/date-input";
import { db } from "@/db";
import { AllowancesTable, ConfigsTable, SelectAllowances } from "@/db/schema";
import { createAllowance } from "../modules/allowance/actions/create-allowance";
import { PayAllowanceButton } from "../modules/allowance/components/pay-allowance-button";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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

function calculateAllowances(allowances: SelectAllowances[], percentage = 0.2) {
  const lastAllowance = allowances?.at?.(-1);
  if (!lastAllowance) return [];

  let lastAllowanceAmount = parseFloat(lastAllowance.amount);

  return Array(5)
    .fill(null)
    .map((_, index) => {
      const date = new Date(lastAllowance?.date);
      date.setDate(1);
      date.setMonth(date.getMonth() + (index + 1));
      const amount = lastAllowanceAmount + lastAllowanceAmount * percentage;
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

async function Home() {
  const allowances = await db.select().from(AllowancesTable);
  const [{ percentage }] = await db
    .select({ percentage: ConfigsTable.value })
    .from(ConfigsTable)
    .where(eq(ConfigsTable.key, "PERCENTAGE"))
    .limit(1);
  const totalPayed =
    allowances.reduce((total, { diff }) => total + parseFloat(diff), 0) ?? 0;
  const calculatedAllowances = calculateAllowances(
    allowances,
    parseFloat(percentage) / 100
  );

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

  async function onSubmitPercentage(formData: FormData) {
    "use server";

    const newPercentage = formData.get("percentage")?.toString?.();

    await db
      .update(ConfigsTable)
      .set({
        value: newPercentage,
      })
      .where(eq(ConfigsTable.key, "PERCENTAGE"));

    revalidatePath("/");
  }

  return (
    <div className="space-y-8">
      <h1 className="text-5xl">Calculador de mesada</h1>
      <form action={onSubmitPercentage}>
        <fieldset>
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Porcentaje mensual</span>
            </div>
            <div className="join">
              <label className="input join-item input-bordered flex items-center gap-2 grow">
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
                    d="m9 14.25 6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185ZM9.75 9h.008v.008H9.75V9Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 4.5h.008v.008h-.008V13.5Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                  />
                </svg>
                <input
                  type="number"
                  className="grow"
                  placeholder="Email"
                  name="percentage"
                  defaultValue={percentage}
                />
              </label>
              <button className="btn btn-primary join-item">Guardar</button>
            </div>
          </label>
        </fieldset>
      </form>
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

export default withPageAuthRequired(Home, { returnTo: "/" });
