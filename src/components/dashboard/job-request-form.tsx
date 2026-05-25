"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, PackagePlus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SelectField, TextAreaField, TextField } from "@/components/ui/input";
import { DropdownOption, LookupBundle } from "@/lib/types";

type LookupStatus = "loading" | "ready" | "error";

const emptyLookups: LookupBundle = {
  countries: [],
  cargoModes: [],
  courierModes: [],
  itemTypes: [],
  deliveryTypes: [],
};

function numberFromText(value: FormDataEntryValue | null) {
  return Number(String(value || "").replace(/[^0-9.]/g, "")) || 0;
}

function idFromForm(value: FormDataEntryValue | null) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : 0;
}

function firstOptionId(options: DropdownOption[], preferredName?: string) {
  const preferred = preferredName
    ? options.find((option) =>
        option.name.toLowerCase().includes(preferredName.toLowerCase()),
      )
    : undefined;
  return String((preferred || options[0])?.id || "");
}

function optionList(options: DropdownOption[], emptyLabel: string) {
  if (options.length === 0) {
    return (
      <option value="" disabled>
        {emptyLabel}
      </option>
    );
  }

  return options.map((option) => (
    <option key={option.id} value={option.id}>
      {option.name}
    </option>
  ));
}

function pickCityId(options: DropdownOption[], current: string, preferredName: string) {
  if (options.some((option) => String(option.id) === current)) {
    return current;
  }

  return firstOptionId(options, preferredName);
}

export function JobRequestForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "draft" | "submitting" | "submitted">(
    "idle",
  );
  const [error, setError] = useState("");
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>("loading");
  const [lookupError, setLookupError] = useState("");
  const [lookups, setLookups] = useState<LookupBundle>(emptyLookups);
  const [originCountryId, setOriginCountryId] = useState("");
  const [destinationCountryId, setDestinationCountryId] = useState("");
  const [originCities, setOriginCities] = useState<DropdownOption[]>([]);
  const [destinationCities, setDestinationCities] = useState<DropdownOption[]>([]);
  const [originCityId, setOriginCityId] = useState("");
  const [destinationCityId, setDestinationCityId] = useState("");
  const [cargoModeId, setCargoModeId] = useState("");
  const [courierModeId, setCourierModeId] = useState("");
  const [itemTypeId, setItemTypeId] = useState("");
  const [deliveryTypeId, setDeliveryTypeId] = useState("");
  const controlsDisabled = lookupStatus !== "ready";

  useEffect(() => {
    let isActive = true;

    async function loadLookups() {
      setLookupStatus("loading");
      setLookupError("");

      try {
        const response = await fetch("/api/lookups", { cache: "no-store" });
        const result = await response.json();

        if (!response.ok || !result.isSuccess || !result.value) {
          throw new Error(
            (result.error || result.errors || ["Unable to load shipment options"]).join(", "),
          );
        }

        if (!isActive) {
          return;
        }

        const value = result.value as LookupBundle;
        setLookups(value);
        setOriginCountryId(firstOptionId(value.countries, "Pakistan"));
        setDestinationCountryId(firstOptionId(value.countries, "Germany"));
        setCargoModeId(firstOptionId(value.cargoModes, "Sea"));
        setCourierModeId(firstOptionId(value.courierModes, "Door"));
        setItemTypeId(firstOptionId(value.itemTypes, "Cartons"));
        setDeliveryTypeId(firstOptionId(value.deliveryTypes, "Standard"));
        setLookupStatus("ready");
      } catch (loadError) {
        if (!isActive) {
          return;
        }

        setLookupStatus("error");
        setLookupError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load shipment options",
        );
      }
    }

    loadLookups();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadOriginCities() {
      if (!originCountryId) {
        setOriginCities([]);
        setOriginCityId("");
        return;
      }

      try {
        const response = await fetch(`/api/lookups/cities/${originCountryId}`, {
          cache: "no-store",
        });
        const result = await response.json();

        if (!isActive) {
          return;
        }

        if (!response.ok || !result.isSuccess) {
          throw new Error();
        }

        const cities = (result.value || []) as DropdownOption[];
        setOriginCities(cities);
        setOriginCityId((current) => pickCityId(cities, current, "Karachi"));
      } catch {
        if (isActive) {
          setOriginCities([]);
          setOriginCityId("");
        }
      }
    }

    loadOriginCities();

    return () => {
      isActive = false;
    };
  }, [originCountryId]);

  useEffect(() => {
    let isActive = true;

    async function loadDestinationCities() {
      if (!destinationCountryId) {
        setDestinationCities([]);
        setDestinationCityId("");
        return;
      }

      try {
        const response = await fetch(`/api/lookups/cities/${destinationCountryId}`, {
          cache: "no-store",
        });
        const result = await response.json();

        if (!isActive) {
          return;
        }

        if (!response.ok || !result.isSuccess) {
          throw new Error();
        }

        const cities = (result.value || []) as DropdownOption[];
        setDestinationCities(cities);
        setDestinationCityId((current) => pickCityId(cities, current, "Hamburg"));
      } catch {
        if (isActive) {
          setDestinationCities([]);
          setDestinationCityId("");
        }
      }
    }

    loadDestinationCities();

    return () => {
      isActive = false;
    };
  }, [destinationCountryId]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("submitting");

    const form = new FormData(event.currentTarget);
    const courierModeId = idFromForm(form.get("courierModeId"));
    const cargoModeId = idFromForm(form.get("cargoModeId"));
    const itemTypeId = idFromForm(form.get("itemTypeId"));
    const deliveryTypeId = idFromForm(form.get("deliveryTypeId"));
    const selectedOriginCountryId = idFromForm(form.get("originCountryId"));
    const selectedDestinationCountryId = idFromForm(form.get("destinationCountryId"));
    const selectedOriginCityId = idFromForm(form.get("originCityId"));
    const selectedDestinationCityId = idFromForm(form.get("destinationCityId"));

    if (
      !courierModeId ||
      !cargoModeId ||
      !itemTypeId ||
      !deliveryTypeId ||
      !selectedOriginCountryId ||
      !selectedDestinationCountryId ||
      !selectedOriginCityId ||
      !selectedDestinationCityId
    ) {
      setStatus("idle");
      setError("Choose route, shipping, speed, and item options before requesting bids.");
      return;
    }

    const payload = {
      courierModeId,
      cargoModeId,
      itemTypeId,
      deliveryTypeId,
      originCountryId: selectedOriginCountryId,
      destinationCountryId: selectedDestinationCountryId,
      originCityId: selectedOriginCityId,
      destinationCityId: selectedDestinationCityId,
      originAddress: String(form.get("originAddress")),
      destinationAddress: String(form.get("destinationAddress")),
      recipientName: String(form.get("recipientName")),
      recipientEmail: String(form.get("recipientEmail")),
      recipientContact: String(form.get("recipientContact")),
      pickupDateUtc: form.get("pickupDate")
        ? new Date(String(form.get("pickupDate"))).toISOString()
        : null,
      jobItems: [
        {
          itemName: String(form.get("itemName")),
          quantity: numberFromText(form.get("quantity")),
          weight: numberFromText(form.get("weight")),
          declaredValue: numberFromText(form.get("declaredValue")),
          itemTypeId,
          description: String(form.get("description")),
        },
      ],
    };

    let response: Response;
    let result;

    try {
      response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      result = await response.json();
    } catch {
      setStatus("idle");
      setError("Unable to create the shipment request right now.");
      return;
    }

    if (!response.ok || !result.isSuccess) {
      setStatus("idle");
      setError((result.error || result.errors || ["Unable to create job"]).join(", "));
      return;
    }

    setStatus("submitted");
    const jobId = result.value?.jobId || result.value?.JobId || 1001;
    router.push(`/jobs/${jobId}/bids`);
  }

  return (
    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_368px]">
      <div className="grid gap-6">
        <Card className="p-5">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase text-[#8083A3]">
                Route
              </p>
              <h2 className="mt-1 text-2xl font-bold text-[#171721]">
                Where should this cargo move?
              </h2>
            </div>
            <div className="rounded-lg bg-[#BFF000] p-3">
              <PackagePlus size={20} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              label="Origin country"
              name="originCountryId"
              value={originCountryId}
              onChange={(event) => setOriginCountryId(event.target.value)}
              disabled={controlsDisabled}
              required
            >
              {optionList(lookups.countries, "No countries available")}
            </SelectField>
            <SelectField
              label="Destination country"
              name="destinationCountryId"
              value={destinationCountryId}
              onChange={(event) => setDestinationCountryId(event.target.value)}
              disabled={controlsDisabled}
              required
            >
              {optionList(lookups.countries, "No countries available")}
            </SelectField>
            <SelectField
              label="Origin city"
              name="originCityId"
              value={originCityId}
              onChange={(event) => setOriginCityId(event.target.value)}
              disabled={controlsDisabled || originCities.length === 0}
              required
            >
              {optionList(originCities, "No cities available")}
            </SelectField>
            <SelectField
              label="Destination city"
              name="destinationCityId"
              value={destinationCityId}
              onChange={(event) => setDestinationCityId(event.target.value)}
              disabled={controlsDisabled || destinationCities.length === 0}
              required
            >
              {optionList(destinationCities, "No cities available")}
            </SelectField>
            <TextField label="Origin address" name="originAddress" defaultValue="Warehouse 12, Port Qasim" />
            <TextField label="Destination address" name="destinationAddress" defaultValue="Hamburg port terminal" />
            <TextField label="Recipient name" name="recipientName" defaultValue="Jamal Meyer" />
            <TextField label="Recipient email" name="recipientEmail" type="email" defaultValue="jamal@example.com" />
            <TextField label="Recipient contact" name="recipientContact" defaultValue="+49 40 000000" />
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-bold uppercase text-[#8083A3]">
            Shipping terms
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <SelectField
              label="Cargo mode"
              name="cargoModeId"
              value={cargoModeId}
              onChange={(event) => setCargoModeId(event.target.value)}
              disabled={controlsDisabled}
              required
            >
              {optionList(lookups.cargoModes, "No cargo modes available")}
            </SelectField>
            <SelectField
              label="Service"
              name="courierModeId"
              value={courierModeId}
              onChange={(event) => setCourierModeId(event.target.value)}
              disabled={controlsDisabled}
              required
            >
              {optionList(lookups.courierModes, "No services available")}
            </SelectField>
            <SelectField
              label="Speed"
              name="deliveryTypeId"
              value={deliveryTypeId}
              onChange={(event) => setDeliveryTypeId(event.target.value)}
              disabled={controlsDisabled}
              required
            >
              {lookups.deliveryTypes.length === 0 ? (
                <option value="" disabled>
                  No speeds available
                </option>
              ) : (
                lookups.deliveryTypes.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                    {option.noOfDays ? ` (${option.noOfDays} days)` : ""}
                  </option>
                ))
              )}
            </SelectField>
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-bold uppercase text-[#8083A3]">
            Items
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-4">
            <TextField label="Item name" name="itemName" defaultValue="Textile cartons" className="md:col-span-2" />
            <SelectField
              label="Item type"
              name="itemTypeId"
              value={itemTypeId}
              onChange={(event) => setItemTypeId(event.target.value)}
              disabled={controlsDisabled}
              required
            >
              {optionList(lookups.itemTypes, "No item types available")}
            </SelectField>
            <TextField label="Quantity" name="quantity" defaultValue="24" />
            <TextField label="Weight" name="weight" defaultValue="1180 kg" />
            <TextField label="Declared value" name="declaredValue" defaultValue="PKR 1,750,000" className="md:col-span-2" />
            <TextField label="Pickup date" name="pickupDate" type="date" className="md:col-span-2" />
            <TextAreaField
              label="Notes for courier companies"
              name="description"
              defaultValue="Export cartons. Please quote ocean freight, origin handling, customs clearance, and last-mile delivery."
              className="md:col-span-4"
            />
          </div>
        </Card>
      </div>

      <aside className="grid h-fit gap-4">
        <Card className="p-5">
          <p className="text-sm font-bold text-[#171721]">Your progress</p>
          <div className="mt-4 h-2 rounded-full bg-[#E4E6E8]">
            <div className="h-2 w-[64%] rounded-full bg-[#BFF000]" />
          </div>
          <p className="mt-3 text-sm text-[#8083A3]">5 of 7 steps complete</p>
          <ul className="mt-5 grid gap-3 text-sm text-[#595D62]">
            {["Route", "Shipping terms", "Dates", "Items", "Container & mode", "Service speed", "Pick a vessel"].map((step, index) => (
              <li key={step} className="flex items-center gap-3">
                <span className={index < 5 ? "h-4 w-4 rounded-full bg-[#BFF000]" : "h-4 w-4 rounded-full bg-[#E4E6E8]"} />
                {step}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-bold uppercase text-[#8083A3]">
            Estimated
          </p>
          <p className="mt-2 text-2xl font-bold text-[#171721]">PKR 1.2M - 1.6M</p>
          <p className="mt-2 text-sm text-[#8083A3]">
            Final quote calculates after courier companies submit bid offers.
          </p>
          {lookupStatus === "loading" ? (
            <p className="mt-4 rounded-lg bg-[#F5F5FA] p-3 text-sm font-medium text-[#595D62]">
              Loading live shipment options...
            </p>
          ) : null}
          {lookupStatus === "error" ? (
            <p className="mt-4 rounded-lg bg-[#FFF0EF] p-3 text-sm font-medium text-[#EB5E55]">
              {lookupError}
            </p>
          ) : null}
          {error ? (
            <p className="mt-4 rounded-lg bg-[#FFF0EF] p-3 text-sm font-medium text-[#EB5E55]">
              {error}
            </p>
          ) : null}
          {status === "draft" ? (
            <p className="mt-4 rounded-lg bg-[#F5F5FA] p-3 text-sm font-medium text-[#595D62]">
              Draft saved locally.
            </p>
          ) : null}
          <div className="mt-5 grid gap-3">
            <Button
              type="button"
              variant="secondary"
              icon={<Save size={16} />}
              onClick={() => setStatus("draft")}
            >
              Save draft
            </Button>
            <Button
              type="submit"
              disabled={status === "submitting" || lookupStatus !== "ready"}
              icon={<ArrowRight size={16} />}
            >
              {status === "submitting" ? "Sending..." : "Confirm & request bids"}
            </Button>
          </div>
        </Card>
      </aside>
    </form>
  );
}
