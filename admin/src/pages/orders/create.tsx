import Card from "@components/common/card";
import Layout from "@components/layouts/admin";
import Search from "@components/common/search";
import ErrorMessage from "@components/ui/error-message";
import Loader from "@components/ui/loader/loader";
import { useState } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { adminOnly } from "@utils/auth-utils";
import CategoryTypeFilter from "@components/product/category-type-filter";
import cn from "classnames";
import { ArrowDown } from "@components/icons/arrow-down";
import { ArrowUp } from "@components/icons/arrow-up";
import ProductCard from "@components/product/digital-card";
import Cart from "@components/cart/cart";
import { useUI } from "@contexts/ui.context";
import DrawerWrapper from "@components/ui/drawer-wrapper";
import Drawer from "@components/ui/drawer";
import CartCounterButton from "@components/cart/cart-counter-button";
import Pagination from "@components/ui/pagination";
import { Product, ProductStatus } from "@ts-types/generated";
import { useProductsQuery } from "@data/product/products.query";
import NotFound from "@components/ui/not-found";

export default function ProductsPage() {
	const { t } = useTranslation();
	const [searchTerm, setSearchTerm] = useState("");
	const [type, setType] = useState("");
	const [category, setCategory] = useState("");
	const [page, setPage] = useState(1);
	const [visible, setVisible] = useState(false);
	const { displayCartSidebar, closeCartSidebar } = useUI();
	const toggleVisible = () => {
		setVisible((v) => !v);
	};

	const {
		data,
		isLoading: loading,
		error,
	} = useProductsQuery({
		limit: 18,
		status: ProductStatus.Publish,
		text: searchTerm,
		page,
		type,
		category,
	});

	if (loading) return <Loader text={t("common:text-loading")} />;
	if (error) return <ErrorMessage message={error.message} />;

	function handleSearch({ searchText }: { searchText: string }) {
		setSearchTerm(searchText);
	}
	function handlePagination(current: any) {
		setPage(current);
	}
	const { products } = data;
	return (
		<>
			<Card className="flex flex-col mb-8">
				<div className="flex flex-col items-center w-full md:flex-row">
					<div className="mb-4 md:w-1/4 md:mb-0">
						<h1 className="text-lg font-semibold text-heading">
							{t("form:input-label-create-order")}
						</h1>
					</div>

					<div className="flex flex-col items-center w-full md:w-3/4 ms-auto">
						<Search onSearch={handleSearch} />
					</div>

					<button
						className="flex items-center mt-5 text-base font-semibold text-accent md:ms-5 md:mt-0"
						onClick={toggleVisible}
					>
						{t("common:text-filter")}{" "}
						{visible ? (
							<ArrowUp className="ms-2" />
						) : (
							<ArrowDown className="ms-2" />
						)}
					</button>
				</div>

				<div
					className={cn("w-full flex transition", {
						"h-auto visible": visible,
						"h-0 invisible": !visible,
					})}
				>
					<div className="flex flex-col w-full pt-5 mt-5 border-t border-gray-200 md:flex-row md:items-center md:mt-8 md:pt-8">
						<CategoryTypeFilter
							onCategoryFilter={({ slug }: { slug: string }) => {
								setCategory(slug);
								setPage(1);
							}}
							onTypeFilter={({ slug }: { slug: string }) => {
								setType(slug);
								setPage(1);
							}}
							className="w-full"
						/>
					</div>
				</div>
			</Card>

			{/* <Card> */}
			<div className="flex space-x-5">
				<div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 2xl:gap-5">
					{products?.data?.map((product: Product) => (
						<ProductCard key={product.id} item={product} />
					))}
				</div>
			</div>
			{!products?.data?.length ? (
				<NotFound text="text-not-found" className="w-7/12 mx-auto" />
			) : null}
			<div className="flex justify-center w-full mt-8">
				{!!products?.paginatorInfo.total && (
					<div className="flex items-center justify-end">
						<Pagination
							total={products?.paginatorInfo.total}
							current={products?.paginatorInfo.currentPage}
							pageSize={products?.paginatorInfo.perPage}
							onChange={handlePagination}
							showLessItems
						/>
					</div>
				)}
			</div>
			{/* <div className="w-[440px] flex-shrink-0 bg-white">
          <Cart />
        </div> */}
			{/* </div> */}

			{/* Mobile cart Drawer */}
			<CartCounterButton />
			<Drawer
				open={displayCartSidebar}
				onClose={closeCartSidebar}
				variant="right"
			>
				<DrawerWrapper hideTopBar={true}>
					<Cart />
				</DrawerWrapper>
			</Drawer>
		</>
	);
}
ProductsPage.authenticate = {
	permissions: adminOnly,
};
ProductsPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ["table", "common", "form"])),
	},
});
