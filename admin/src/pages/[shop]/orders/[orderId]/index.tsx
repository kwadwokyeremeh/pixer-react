import Card from "@components/common/card";
import Image from "next/image";
import { Table } from "@components/ui/table";
import ProgressBox from "@components/ui/progress-box/progress-box";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import Button from "@components/ui/button";
import ErrorMessage from "@components/ui/error-message";
import { siteSettings } from "@settings/site.settings";
import usePrice from "@utils/use-price";
import { formatAddress } from "@utils/format-address";
import Loader from "@components/ui/loader/loader";
import ValidationError from "@components/ui/form-validation-error";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import SelectInput from "@components/ui/select-input";
import ShopLayout from "@components/layouts/shop";
import { useIsRTL } from "@utils/locals";
import { adminOwnerAndStaffOnly } from "@utils/auth-utils";
import { useUpdateOrderMutation } from "@data/order/use-order-update.mutation";
import { useOrderStatusesQuery } from "@data/order-status/use-order-statuses.query";
import { useOrderQuery } from "@data/order/use-order.query";
import { Attachment } from "@ts-types/generated";
import { DownloadIcon } from "@components/icons/download-icon";
import { PDFDownloadLink } from "@react-pdf/renderer";
import InvoicePdf from "@components/order/invoice-pdf";
import { useSettings } from "@contexts/settings.context";

type FormValues = {
	order_status: any;
};
export default function OrderDetailsPage() {
	const { t } = useTranslation();
	const { query } = useRouter();
	const settings = useSettings();
	const { alignLeft, alignRight } = useIsRTL();
	const { mutate: updateOrder, isLoading: updating } = useUpdateOrderMutation();
	const { data: orderStatusData } = useOrderStatusesQuery({
		limit: 100,
	});

	const {
		data,
		isLoading: loading,
		error,
	} = useOrderQuery(query.orderId as string);

	const {
		handleSubmit,
		control,

		formState: { errors },
	} = useForm<FormValues>({
		defaultValues: { order_status: data?.order?.status ?? "" },
	});

	const ChangeStatus = ({ order_status }: FormValues) => {
		updateOrder({
			variables: {
				id: data?.order?.id as string,
				input: {
					status: order_status?.id as string,
				},
			},
		});
	};
	const { price: subtotal } = usePrice(
		data && {
			amount: data?.order?.amount!,
		}
	);
	const { price: total } = usePrice(
		data && {
			amount: data?.order?.paid_total!,
		}
	);
	const { price: discount } = usePrice(
		data && {
			amount: data?.order?.discount!,
		}
	);
	const { price: delivery_fee } = usePrice(
		data && {
			amount: data?.order?.delivery_fee!,
		}
	);
	const { price: sales_tax } = usePrice(
		data && {
			amount: data?.order?.sales_tax!,
		}
	);
	if (loading) return <Loader text={t("common:text-loading")} />;
	if (error) return <ErrorMessage message={error.message} />;

	const columns = [
		{
			dataIndex: "image",
			key: "image",
			width: 70,
			render: (image: Attachment) => (
				<Image
					src={image?.thumbnail ?? siteSettings.product.placeholder}
					alt="alt text"
					layout="fixed"
					width={50}
					height={50}
				/>
			),
		},
		{
			title: t("table:table-item-products"),
			dataIndex: "name",
			key: "name",
			align: alignLeft,
			render: (name: string, item: any) => (
				<div>
					<span>{name}</span>
					<span className="mx-2">x</span>
					<span className="font-semibold text-heading">
						{item.pivot.order_quantity}
					</span>
				</div>
			),
		},
		{
			title: t("table:table-item-total"),
			dataIndex: "pivot",
			key: "pivot",
			align: alignRight,
			render: (pivot: any) => {
				const { price } = usePrice({
					amount: Number(pivot?.subtotal),
				});
				return <span>{price}</span>;
			},
		},
	];

	return (
		<Card>
			<div className="flex w-full">
				<Button size="small" className="mb-5 ms-auto">
					<DownloadIcon className="w-4 h-4 me-3" />
					<PDFDownloadLink
						document={
							<InvoicePdf
								subtotal={subtotal}
								total={total}
								discount={discount}
								delivery_fee={delivery_fee}
								sales_tax={sales_tax}
								settings={settings}
								//@ts-ignore
								order={data?.order}
							/>
						}
						fileName="invoice.pdf"
					>
						{({ loading }: any) =>
							loading
								? t("common:text-loading")
								: `${t("common:text-download")} ${t("common:text-invoice")}`
						}
					</PDFDownloadLink>
				</Button>
			</div>

			<div className="flex flex-col items-center lg:flex-row">
				<h3 className="w-full mb-8 text-2xl font-semibold text-center text-heading lg:text-start lg:w-1/3 lg:mb-0 whitespace-nowrap">
					{t("form:input-label-order-id")} - {data?.order?.tracking_number}
				</h3>

				<form
					onSubmit={handleSubmit(ChangeStatus)}
					className="flex items-start w-full ms-auto lg:w-2/4"
				>
					<div className="z-20 w-full me-5">
						<SelectInput
							name="order_status"
							control={control}
							getOptionLabel={(option: any) => option.name}
							getOptionValue={(option: any) => option.id}
							options={orderStatusData?.order_statuses?.data!}
							placeholder={t("form:input-placeholder-order-status")}
							rules={{
								required: "Status is required",
							}}
						/>

						<ValidationError message={t(errors?.order_status?.message)} />
					</div>
					<Button loading={updating}>
						<span className="hidden sm:block">
							{t("form:button-label-change-status")}
						</span>
						<span className="block sm:hidden">
							{t("form:button-label-change")}
						</span>
					</Button>
				</form>
			</div>

			<div className="flex items-center justify-center my-5 lg:my-10">
				<ProgressBox
					data={orderStatusData?.order_statuses?.data}
					status={data?.order?.status?.serial!}
				/>
			</div>

			<div className="mb-10">
				{data?.order ? (
					<Table
						//@ts-ignore
						columns={columns}
						emptyText={t("table:empty-table-data")}
						//@ts-ignore
						data={data?.order?.products!}
						rowKey="id"
						scroll={{ x: 300 }}
					/>
				) : (
					<span>{t("common:no-order-found")}</span>
				)}

				<div className="flex flex-col w-full px-4 py-4 space-y-2 border-t-4 border-double border-border-200 sm:w-1/2 md:w-1/3 ms-auto">
					<div className="flex items-center justify-between text-sm text-body">
						<span>{t("common:order-sub-total")}</span>
						<span>{subtotal}</span>
					</div>
					<div className="flex items-center justify-between text-sm text-body">
						<span>{t("common:order-tax")}</span>
						<span>{sales_tax}</span>
					</div>
					<div className="flex items-center justify-between text-sm text-body">
						<span>{t("common:order-delivery-fee")}</span>
						<span>{delivery_fee}</span>
					</div>
					<div className="flex items-center justify-between text-sm text-body">
						<span>{t("common:order-discount")}</span>
						<span>{discount}</span>
					</div>
					<div className="flex items-center justify-between font-semibold text-body">
						<span>{t("common:order-total")}</span>
						<span>{total}</span>
					</div>
				</div>
			</div>

			<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
				<div className="w-full mb-10 sm:w-1/2 sm:pe-8 sm:mb-0">
					<h3 className="pb-2 mb-3 font-semibold border-b text-heading border-border-200">
						{t("common:billing-address")}
					</h3>

					<div className="flex flex-col items-start space-y-1 text-sm text-body">
						<span>{data?.order?.customer?.name}</span>
						{data?.order?.billing_address && (
							<span>{formatAddress(data.order.billing_address)}</span>
						)}
						{data?.order?.customer_contact && (
							<span>{data?.order?.customer_contact}</span>
						)}
					</div>
				</div>

				<div className="w-full sm:w-1/2 sm:ps-8">
					<h3 className="pb-2 mb-3 font-semibold border-b text-heading text-start sm:text-end border-border-200">
						{t("common:shipping-address")}
					</h3>

					<div className="flex flex-col items-start space-y-1 text-sm text-body text-start sm:text-end sm:items-end">
						<span>{data?.order?.customer?.name}</span>
						{data?.order?.shipping_address && (
							<span>{formatAddress(data.order.shipping_address)}</span>
						)}
						{data?.order?.customer_contact && (
							<span>{data?.order?.customer_contact}</span>
						)}
					</div>
				</div>
			</div>
		</Card>
	);
}
OrderDetailsPage.authenticate = {
	permissions: adminOwnerAndStaffOnly,
};
OrderDetailsPage.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ["common", "form", "table"])),
	},
});
