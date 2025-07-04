import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import AppHeader from "@/components/AppHeader";
import BottomNavigation from "@/components/BottomNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Banknote, Bitcoin, CreditCard, Wallet } from "lucide-react";
import { useGetBanks, useWithdraw } from "@/hooks/api-hooks";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { formatCurrency } from "@/lib/utils";
import { useSocket } from "@/contexts/SocketContext";

const withdrawalMethods = [
  {
    key: "bank",
    label: "Bank Transfer",
  },
  {
    key: "crypto",
    label: "Crypto",
  },
];

type BankForm = {
  bank_code: string;
  bank_name: string;
  amount: string;
  account_name: string;
  account_number: string;
};

type CryptoForm = {
  wallet_address: string;
  amount: string;
};

type PaystackForm = {
  email: string;
  amount: string;
};

const Withdrawal = () => {
  const isMobile = useIsMobile();
  const { wallet, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("bank");
  const [calculatedAmount, setCalculatedAmount] = useState(0);
  const socket = useSocket()
  // const [loading, setLoading] = useState(false);


  const { data: availableBanks, isLoading, error } = useGetBanks()
  const withdrawal = useWithdraw()
  // const {} = 

  // React Hook Form for each method
  const {
    register: registerBank,
    handleSubmit: handleSubmitBank,
    reset: resetBank,
    getValues: getBankFormValues,
    setValue: setBankValue,
    watch: watchBank,
    formState: { errors: errorsBank, },
  } = useForm<BankForm>();

  const {
    register: registerCrypto,
    handleSubmit: handleSubmitCrypto,
    reset: resetCrypto,
    formState: { errors: errorsCrypto },
  } = useForm<CryptoForm>();


  const watchedBankCode = watchBank("bank_code");
  const watchedAmount = watchBank("amount");

  const handleWithdraw = async (data: any, method: string) => {
    await withdrawal.mutateAsync({
      account_name: data.account_name,
      account_number: data.account_number,
      amount: data.amount,
      bank_name: data.bank_name,
      bank_code: data.bank_code,
    })
    resetBank();
    resetCrypto();
  };

  function calaculateReceivedAmount(amount: number) {
    console.log({ calculatedAmount: amount });

    setCalculatedAmount(amount)
  }

  useEffect(() => {
    socket.publish("CALCULATE_WITHDRAWAL_RECIEVED_AMOUNT_EVENT", watchedAmount ?? 0)
  }, [watchedAmount])

  useEffect(() => {
    socket.subscribe("CALCULATE_WITHDRAWAL_RECIEVED_AMOUNT_EVENT", calaculateReceivedAmount)

    return () => socket.unsubscribe("CALCULATE_WITHDRAWAL_RECIEVED_AMOUNT_EVENT", calaculateReceivedAmount)
  }, [calaculateReceivedAmount])

  // Helper for wallet card color/icon
  const walletCardStyles = {
    bank: {
      bg: "",
      icon: <Banknote className="w-6 h-6 text-blue-500" />,
      label: "Bank Wallet Balance",
    },
    crypto: {
      bg: "",
      icon: <Bitcoin className="w-6 h-6 text-yellow-500" />,
      label: "Crypto Wallet Balance",
    },
  };

  return (
    <>
      <AppHeader
        title="Withdraw Funds"
        subtitle="Transfer your earnings securely"
      />
      <div className="container py-6 mb-24">
        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Withdraw to
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full grid grid-cols-2 mb-6">
                {withdrawalMethods.map((method) => (
                  <TabsTrigger
                    disabled={method.key === "crypto"}
                    key={method.key}
                    value={method.key}
                    className="w-full"
                  >
                    {method.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Responsive flex row for wallet + form */}
              <div className="flex flex-col md:flex-row gap-6">
                {/* Wallet Card (left) */}
                <div className="md:w-1/3 w-full">
                  <div className={`rounded-xl border-2 p-5 mb-4 flex flex-col items-center shadow-md ${walletCardStyles[activeTab].bg}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="w-7 h-7 text-primary" />
                      <span className="font-semibold text-lg">Wallet Balance</span>
                    </div>
                    <div className="text-3xl font-bold mb-1 text-primary">
                      ₦{wallet?.balance?.toLocaleString() || "0"}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      {walletCardStyles[activeTab].icon}
                      <span>{walletCardStyles[activeTab].label}</span>
                    </div>
                  </div>
                  {/* Method-specific info below wallet card */}
                  {activeTab === "bank" && (
                    <Alert className="mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Banknote className="w-5 h-5 text-blue-500" />
                        <AlertTitle>Bank Transfer</AlertTitle>
                      </div>
                      <AlertDescription>
                        <ul className="list-disc ml-5 space-y-1">
                          <li>Enter your correct bank details.</li>
                          <li><b>Charge:</b> 0.2% + {formatCurrency(100)} (cappped @ {formatCurrency(2000)}) per withdrawal</li>
                          <li>{formatCurrency(100)} waived for withdrawal below {formatCurrency(2000)}</li>
                          <li><b>Delivery:</b> Almost Instantly</li>
                          <li><b>Note:</b> Provider fee may apply</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                  {activeTab === "crypto" && (
                    <Alert className="mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Bitcoin className="w-5 h-5 text-yellow-500" />
                        <AlertTitle>Crypto Withdrawal</AlertTitle>
                      </div>
                      <AlertDescription>
                        <ul className="list-disc ml-5 space-y-1">
                          <li>Enter your valid crypto wallet address.</li>
                          <li><b>Charge:</b> Network fee applies (varies by blockchain)</li>
                          <li><b>Delivery:</b> 10–60 minutes (network dependent)</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                {/* Form (right) */}
                <div className="md:w-2/3 w-full">
                  {/* Bank Transfer */}
                  <TabsContent value="bank">
                    <form
                      className="space-y-4"
                      onSubmit={handleSubmitBank((data) =>
                        handleWithdraw(data, "bank")
                      )}
                      autoComplete="off"
                    >
                      <div>
                        <Label htmlFor="bank_code">Bank Name</Label>

                        <SearchableSelect
                          options={(availableBanks ?? []).map(bank => ({
                            label: bank.name,
                            value: bank.code,
                            disabled: !bank?.supports_transfer || bank?.is_deleted
                          }))}
                          disabled={isLoading}
                          searchPlaceholder="Select a bank"
                          clearable
                          onValueChange={(bankCode, bankName) => {
                            setBankValue("bank_code", bankCode)
                            setBankValue("bank_name", bankName)
                          }}
                          value={watchedBankCode}
                        />

                      </div>
                      <div>
                        <Label htmlFor="account_name">Account Name</Label>
                        <Input
                          id="account_name"
                          placeholder="e.g. John Doe"
                          {...registerBank("account_name", { required: "Account name is required" })}
                          autoComplete="off"
                        />
                        {errorsBank.account_name && (
                          <span className="text-xs text-red-500">{errorsBank.account_name.message}</span>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="account_number">Account Number</Label>
                        <Input
                          id="account_number"
                          placeholder="e.g. 0123456789"
                          maxLength={12}
                          {...registerBank("account_number", {
                            required: "Account number is required",
                            minLength: { value: 8, message: "Too short" },
                            maxLength: { value: 12, message: "Too long" },
                            pattern: {
                              value: /^[0-9]+$/,
                              message: "Numbers only",
                            },
                          })}
                          autoComplete="off"
                        />
                        {errorsBank.account_number && (
                          <span className="text-xs text-red-500">{errorsBank.account_number.message}</span>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="bank-amount">Amount</Label>
                        <Input
                          id="bank-amount"
                          type="number"
                          min={1}
                          max={wallet?.balance || undefined}
                          placeholder="Enter amount"
                          {...registerBank("amount", {
                            required: "Amount is required",
                            min: { value: 1, message: "Minimum is 1" },
                            validate: (v) =>
                              !wallet?.balance || Number(v) <= wallet.balance
                                ? true
                                : "Exceeds available balance",
                          })}
                          autoComplete="off"
                        />
                        <div className="flex items-center justify-between gap-x-2">
                          <span className="text-xs text-muted-foreground pt-4 font-bold">
                            Available: {formatCurrency(wallet?.balance || 0)}
                          </span>
                          {errorsBank.amount && (
                            <span className="text-xs text-red-500">{errorsBank.amount.message}</span>
                          )}
                          {calculatedAmount > 0 && <span className="text-xs">
                          You will get {formatCurrency(calculatedAmount)}
                        </span>
                      }
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      variant="market"
                      disabled={withdrawal.isPending}
                    >
                      {withdrawal.isPending ? "Processing..." : "Withdraw"}
                    </Button>
                  </form>
                </TabsContent>
                {/* Crypto */}
                <TabsContent value="crypto">
                  <form
                    className="space-y-4"
                    onSubmit={handleSubmitCrypto((data) =>
                      handleWithdraw(data, "crypto")
                    )}
                    autoComplete="off"
                  >
                    <div>
                      <Label htmlFor="wallet_address">Wallet Address</Label>
                      <Input
                        id="wallet_address"
                        placeholder="Enter crypto wallet address"
                        {...registerCrypto("wallet_address", { required: "Wallet address is required" })}
                        autoComplete="off"
                      />
                      {errorsCrypto.wallet_address && (
                        <span className="text-xs text-red-500">{errorsCrypto.wallet_address.message}</span>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="crypto-amount">Amount</Label>
                      <Input
                        id="crypto-amount"
                        type="number"
                        min={1}
                        max={wallet?.balance || undefined}
                        placeholder="Enter amount"
                        {...registerCrypto("amount", {
                          required: "Amount is required",
                          min: { value: 1, message: "Minimum is 1" },
                          validate: (v) =>
                            !wallet?.balance || Number(v) <= wallet.balance
                              ? true
                              : "Exceeds available balance",
                        })}
                        autoComplete="off"
                      />
                      <span className="text-xs text-muted-foreground">
                        Available: ₦{wallet?.balance?.toLocaleString() || "0"}
                      </span>
                      {errorsCrypto.amount && (
                        <span className="text-xs text-red-500">{errorsCrypto.amount.message}</span>
                      )}

                    </div>

                    {/* <span className="text-xs text-foreground">
                          You will get {formatCurrency(calculatedAmount)}
                        </span> */}
                    <Button
                      type="submit"
                      className="w-full"
                      variant="market"
                      disabled={withdrawal.isPending}
                    >
                      {withdrawal.isPending ? "Processing..." : "Withdraw"}
                    </Button>
                  </form>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div >
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <BottomNavigation />
      </div>
    </>
  );
};

export default Withdrawal;

